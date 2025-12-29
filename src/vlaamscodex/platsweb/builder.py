from __future__ import annotations

import http.server
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
    (out_dir / "index.html").write_text(out.index_html, encoding="utf-8")
    (out_dir / "app.js").write_text(out.app_js, encoding="utf-8")
    (out_dir / "app.css").write_text(out.app_css, encoding="utf-8")
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

    def do_GET(self) -> None:  # noqa: N802
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

    def handler_factory(*args: object, **kwargs: object) -> _Handler:
        handler = _Handler(*args, directory=str(out_dir), **kwargs)
        handler.sse_hub = hub
        return handler

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
