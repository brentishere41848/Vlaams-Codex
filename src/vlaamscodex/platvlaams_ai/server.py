from __future__ import annotations

import http.server
import json
import os
import socketserver
import threading
import time
from collections import deque
from dataclasses import dataclass
from pathlib import Path

from .ollama_client import call_ollama_chat, load_ollama_config_from_env
from .policy import process_chat
from .refusal import rate_limited_message


def _load_dotenv_file(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if not s or s.startswith("#") or "=" not in s:
            continue
        k, v = s.split("=", 1)
        k = k.strip()
        v = v.strip().strip('"').strip("'")
        if k and k not in os.environ:
            os.environ[k] = v


def load_dotenv() -> None:
    # Local-first.
    root = Path.cwd()
    _load_dotenv_file(root / ".env.local")
    _load_dotenv_file(root / ".env")


@dataclass(frozen=True)
class ServerConfig:
    web_root: Path
    host: str = "127.0.0.1"
    port: int = 5174
    max_input_chars: int = 8000
    rate_limit_per_minute: int = 30  # 0 = off


def load_server_config_from_env() -> ServerConfig:
    web_root = Path(os.environ.get("VLAAMSCODEX_WEB_ROOT", "website")).resolve()
    host = os.environ.get("VLAAMSCODEX_AI_HOST", "127.0.0.1")
    port = int(os.environ.get("VLAAMSCODEX_AI_PORT", "5174"))
    max_input_chars = int(os.environ.get("MAX_INPUT_CHARS", os.environ.get("AI_MAX_INPUT_CHARS", "8000")))
    rate_limit = int(os.environ.get("RATE_LIMIT_PER_MINUTE", os.environ.get("AI_RATE_LIMIT_PER_MINUTE", "30")))
    return ServerConfig(
        web_root=web_root,
        host=host,
        port=port,
        max_input_chars=max_input_chars,
        rate_limit_per_minute=rate_limit,
    )


class RateLimiter:
    def __init__(self, limit_per_minute: int) -> None:
        self._limit = limit_per_minute
        self._lock = threading.Lock()
        self._hits: dict[str, deque[float]] = {}

    def allow(self, key: str) -> bool:
        if self._limit <= 0:
            return True
        now = time.time()
        cutoff = now - 60.0
        with self._lock:
            dq = self._hits.get(key)
            if dq is None:
                dq = deque()
                self._hits[key] = dq
            while dq and dq[0] < cutoff:
                dq.popleft()
            if len(dq) >= self._limit:
                return False
            dq.append(now)
            return True


class _Handler(http.server.SimpleHTTPRequestHandler):
    # set by factory
    cfg: ServerConfig
    limiter: RateLimiter

    def log_message(self, fmt: str, *args: object) -> None:
        # quiet default server logs
        return

    def _send_json(self, status: int, payload: object) -> None:
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def _read_json_body(self) -> object:
        length = int(self.headers.get("Content-Length", "0"))
        if length > (self.cfg.max_input_chars * 8):
            raise ValueError("body-too-large")
        body = self.rfile.read(length) if length > 0 else b"{}"
        return json.loads(body.decode("utf-8"))

    def do_POST(self) -> None:  # noqa: N802
        if self.path != "/api/chat":
            self._send_json(404, {"error": {"code": "NOT_FOUND", "message": "Nie gevonden."}})
            return

        ip = self.client_address[0]
        if not self.limiter.allow(ip):
            self._send_json(429, {"error": {"code": "RATE_LIMITED", "message": rate_limited_message()}})
            return

        try:
            body = self._read_json_body()
        except ValueError as e:
            if str(e) == "body-too-large":
                print(f"[platvlaams-ai] body too large from {ip}")
                self._send_json(413, {"error": {"code": "TOO_LARGE", "message": "Da is te veel ineens, jong."}})
                return
            self._send_json(400, {"error": {"code": "BAD_JSON", "message": "Da is gene proper JSON, jong."}})
            return
        except Exception:
            self._send_json(400, {"error": {"code": "BAD_JSON", "message": "Da is gene proper JSON, jong."}})
            return

        if not isinstance(body, dict):
            self._send_json(400, {"error": {"code": "BAD_REQUEST", "message": "Da requestke klopt ni."}})
            return

        messages = body.get("messages")
        if not isinstance(messages, list):
            self._send_json(400, {"error": {"code": "BAD_REQUEST", "message": "Ge mist `messages[]`."}})
            return

        # Normalize message shape.
        norm: list[dict[str, str]] = []
        for m in messages:
            if not isinstance(m, dict):
                continue
            role = m.get("role")
            content = m.get("content")
            if role in ("user", "assistant", "system") and isinstance(content, str):
                norm.append({"role": role, "content": content})

        ollama_cfg = load_ollama_config_from_env()

        def _call_model(msgs: list[dict[str, str]]) -> str:
            return call_ollama_chat(ollama_cfg, msgs)

        result = process_chat(messages=norm, call_model=_call_model, max_input_chars=self.cfg.max_input_chars)

        if result.offline:
            print(f"[platvlaams-ai] model offline/misconfig for {ip}")
            self._send_json(503, {"error": {"code": "AI_OFFLINE", "message": result.content}})
            return

        self._send_json(
            200,
            {
                "message": {"role": "assistant", "content": result.content},
                "refused": result.refused,
            },
        )


def serve() -> None:
    load_dotenv()
    cfg = load_server_config_from_env()
    limiter = RateLimiter(cfg.rate_limit_per_minute)

    if not cfg.web_root.exists():
        raise SystemExit(f"[platvlaams-ai] web root nie gevonden: {cfg.web_root}")

    handler_cls = type("_PlatVlaamsAIHandler", (_Handler,), {"cfg": cfg, "limiter": limiter})

    def handler_factory(*args: object, **kwargs: object) -> http.server.SimpleHTTPRequestHandler:
        return handler_cls(*args, directory=str(cfg.web_root), **kwargs)

    class _Server(socketserver.ThreadingMixIn, socketserver.TCPServer):
        allow_reuse_address = True

    with _Server((cfg.host, cfg.port), handler_factory) as httpd:
        print(f"[platvlaams-ai] server: http://{cfg.host}:{cfg.port}/ (web root: {cfg.web_root})")
        print("[platvlaams-ai] chat api: POST /api/chat")
        httpd.serve_forever()


if __name__ == "__main__":
    serve()
