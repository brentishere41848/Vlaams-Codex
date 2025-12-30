from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from dataclasses import dataclass

from .prompt import SYSTEM_PROMPT_PLAT_VLAAMS_ONLY


@dataclass(frozen=True)
class OllamaConfig:
    base_url: str
    model: str
    timeout_s: float = 20.0


def load_ollama_config_from_env() -> OllamaConfig:
    base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
    model = os.environ.get("OLLAMA_MODEL", "llama3.1")
    timeout_s = float(os.environ.get("OLLAMA_TIMEOUT_S", "20"))
    return OllamaConfig(base_url=base_url, model=model, timeout_s=timeout_s)


def _ollama_chat_url(base_url: str) -> str:
    return f"{base_url}/api/chat"


def call_ollama_chat(cfg: OllamaConfig, messages: list[dict[str, str]]) -> str:
    payload = {
        "model": cfg.model,
        "stream": False,
        "messages": [{"role": "system", "content": SYSTEM_PROMPT_PLAT_VLAAMS_ONLY}, *messages],
    }

    req = urllib.request.Request(
        _ollama_chat_url(cfg.base_url),
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=cfg.timeout_s) as resp:
            raw = resp.read().decode("utf-8")
    except urllib.error.URLError as e:
        raise RuntimeError("ollama-endpoint-unreachable") from e

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise RuntimeError("ollama-endpoint-invalid-json") from e

    try:
        msg = data.get("message") or {}
        content = msg.get("content")
        if isinstance(content, str) and content.strip():
            return content
    except Exception as e:
        raise RuntimeError("ollama-endpoint-bad-shape") from e

    raise RuntimeError("ollama-endpoint-empty-output")

