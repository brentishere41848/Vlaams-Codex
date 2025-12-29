from __future__ import annotations

import http.server
import json
import os
import queue
import socketserver
import threading
import time
import errno
from dataclasses import dataclass
from pathlib import Path

from .compiler import build_platsweb
from .errors import PlatsWebParseError


def _make_inline_html(index_html: str, app_js: str, app_css: str) -> str:
    # Turn the standard 3-file output into a single HTML document.
    # This keeps authoring in .plats while still producing a page that can be hosted as a single file.
    html = index_html.replace(
        '<link rel="stylesheet" href="./app.css">',
        "<style>\n" + app_css.rstrip() + "\n</style>",
    )
    html = html.replace(
        '<script src="./app.js" defer></script>',
        "<script>\n" + app_js.rstrip() + "\n</script>",
    )
    return html


def _find_entry_plats(dir_path: Path) -> Path:
    preferred = dir_path / "page.plats"
    if preferred.exists():
        return preferred
    candidates = sorted(dir_path.glob("*.plats"))
    if not candidates:
        raise PlatsWebParseError("no .plats file found in directory (expected page.plats or *.plats)", 1, 1)
    return candidates[0]


def build_dir(dir_path: Path, out_dir: Path | None = None, dev: bool = False) -> Path:
    if out_dir is None:
        out_dir = dir_path / "dist"
    entry = _find_entry_plats(dir_path)
    src = entry.read_text(encoding="utf-8")

    out = build_platsweb(src, dev=dev)
    out_dir.mkdir(parents=True, exist_ok=True)
    # PlatsWeb output is a single-file page: index.plats (served as text/html).
    (out_dir / "index.plats").write_text(_make_inline_html(out.index_html, out.app_js, out.app_css), encoding="utf-8")
    # Also emit the original Plats source into dist so dist contains actual Plats too.
    (out_dir / entry.name).write_text(src, encoding="utf-8")
    # Hosting helper: allow .plats to behave like .html on common static hosts (Vercel).
    (out_dir / "vercel.json").write_text(
        json.dumps(
            {
                "headers": [
                    {
                        "source": r"/(.*)\.plats",
                        "headers": [{"key": "Content-Type", "value": "text/html; charset=utf-8"}],
                    }
                ],
                "rewrites": [{"source": "/", "destination": "/index.plats"}],
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    # Netlify / Cloudflare Pages style headers + root rewrite.
    (out_dir / "_headers").write_text(
        "/*.plats\n"
        "  Content-Type: text/html; charset=utf-8\n"
        "\n",
        encoding="utf-8",
    )
    (out_dir / "_redirects").write_text("/ /index.plats 200\n", encoding="utf-8")
    # Apache: treat .plats as HTML.
    (out_dir / ".htaccess").write_text("AddType text/html .plats\n", encoding="utf-8")
    # Clean up older outputs if present.
    for legacy in ("index.html", "app.js", "app.css"):
        p = out_dir / legacy
        try:
            p.unlink()
        except FileNotFoundError:
            pass
    return out_dir


@dataclass
class _SSEHub:
    clients: set[queue.Queue]  # queue of events

    def __init__(self) -> None:
        self.clients = set()

    def add(self) -> queue.Queue:
        q: queue.Queue[str] = queue.Queue()
        self.clients.add(q)
        return q

    def remove(self, q: queue.Queue) -> None:
        self.clients.discard(q)

    def broadcast(self, msg: str = "reload") -> None:
        for q in list(self.clients):
            try:
                q.put_nowait(msg)
            except Exception:
                self.remove(q)


class _Handler(http.server.SimpleHTTPRequestHandler):
    # set by factory
    sse_hub: _SSEHub

    def guess_type(self, path: str) -> str:
        # Allow .plats output to be served as HTML so it "works like .html" in dev.
        if path.endswith(".plats"):
            return "text/html"
        return super().guess_type(path)

    def do_GET(self) -> None:  # noqa: N802
        if self.path in ("/", "/index.html"):
            self.path = "/index.plats"
        if self.path.startswith("/__platsweb_events"):
            q = self.sse_hub.add()
            try:
                self.send_response(200)
                self.send_header("Content-Type", "text/event-stream")
                self.send_header("Cache-Control", "no-cache")
                self.send_header("Connection", "keep-alive")
                self.end_headers()
                self.wfile.write(b": platsweb\n\n")
                self.wfile.flush()
                while True:
                    try:
                        msg = q.get(timeout=15.0)
                    except queue.Empty:
                        self.wfile.write(b": keepalive\n\n")
                        self.wfile.flush()
                        continue
                    payload = f"data: {msg}\n\n".encode("utf-8")
                    self.wfile.write(payload)
                    self.wfile.flush()
            except Exception:
                pass
            finally:
                self.sse_hub.remove(q)
            return

        return super().do_GET()

    def log_message(self, fmt: str, *args: object) -> None:
        # quiet default server logs
        return


def dev_dir(dir_path: Path, host: str = "127.0.0.1", port: int = 5173, allow_port_fallback: bool = False) -> int:
    out_dir = build_dir(dir_path, dev=True)
    entry = _find_entry_plats(dir_path)

    hub = _SSEHub()

    # BaseHTTPRequestHandler calls .handle() from __init__, so we must attach the hub
    # before instantiation (class attribute), not after.
    handler_cls = type("_PlatsWebHandler", (_Handler,), {"sse_hub": hub})

    def handler_factory(*args: object, **kwargs: object) -> http.server.SimpleHTTPRequestHandler:
        return handler_cls(*args, directory=str(out_dir), **kwargs)

    class _Server(socketserver.ThreadingMixIn, socketserver.TCPServer):
        allow_reuse_address = True

    def watcher() -> None:
        last_mtime = entry.stat().st_mtime
        while True:
            try:
                mtime = entry.stat().st_mtime
            except FileNotFoundError:
                time.sleep(0.5)
                continue
            if mtime != last_mtime:
                last_mtime = mtime
                try:
                    build_dir(dir_path, dev=True)
                    hub.broadcast("reload")
                except PlatsWebParseError:
                    # keep dev server alive even on parse errors
                    hub.broadcast("reload")
            time.sleep(0.5)

    t = threading.Thread(target=watcher, daemon=True)
    t.start()

    def _print_url(bound_port: int) -> None:
        if host == "0.0.0.0":
            print(f"[platsweb] dev server: http://127.0.0.1:{bound_port}/ (bound to 0.0.0.0)")
        else:
            print(f"[platsweb] dev server: http://{host}:{bound_port}/")
        print(f"[platsweb] watching: {entry}")

    def _serve(bound_port: int) -> int:
        with _Server((host, bound_port), handler_factory) as httpd:
            _print_url(bound_port)
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                return 0
        return 0

    if not allow_port_fallback:
        return _serve(port)

    # Port fallback (MVP): if the default port is busy, try the next few ports.
    for try_port in range(port, port + 20):
        try:
            return _serve(try_port)
        except OSError as e:
            if e.errno == errno.EADDRINUSE:
                continue
            raise

    raise OSError(errno.EADDRINUSE, "No free port found for PlatsWeb dev server")
