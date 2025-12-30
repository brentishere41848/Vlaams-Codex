from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from dataclasses import dataclass

from .prompt import SYSTEM_PROMPT_PLAT_VLAAMS_ONLY


@dataclass(frozen=True)
class OpenAIConfig:
    base_url: str
    model: str
    api_key: str
    temperature: float = 0.3
    timeout_s: float = 20.0


def load_openai_config_from_env() -> OpenAIConfig:
    base_url = os.environ.get("OPENAI_BASE_URL", "http://localhost:8000/v1").rstrip("/")
    model = os.environ.get("OPENAI_MODEL", "local-model")
    api_key = os.environ.get("OPENAI_API_KEY") or "local"
    temperature = float(os.environ.get("OPENAI_TEMPERATURE", "0.3"))
    timeout_s = float(os.environ.get("OPENAI_TIMEOUT_S", "20"))
    return OpenAIConfig(base_url=base_url, model=model, api_key=api_key, temperature=temperature, timeout_s=timeout_s)


def _chat_completions_url(base_url: str) -> str:
    # Expect OPENAI_BASE_URL like http://localhost:8000/v1
    return f"{base_url}/chat/completions"


def call_openai_chat_completions(cfg: OpenAIConfig, messages: list[dict[str, str]]) -> str:
    payload = {
        "model": cfg.model,
        "temperature": cfg.temperature,
        "stream": False,
        "messages": [{"role": "system", "content": SYSTEM_PROMPT_PLAT_VLAAMS_ONLY}, *messages],
    }

    req = urllib.request.Request(
        _chat_completions_url(cfg.base_url),
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {cfg.api_key}",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=cfg.timeout_s) as resp:
            raw = resp.read().decode("utf-8")
    except urllib.error.URLError as e:
        raise RuntimeError("openai-endpoint-unreachable") from e

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise RuntimeError("openai-endpoint-invalid-json") from e

    if isinstance(data, dict) and "error" in data:
        raise RuntimeError("openai-endpoint-error")

    try:
        choice0 = data["choices"][0]
        msg = choice0.get("message") or {}
        content = msg.get("content")
        if isinstance(content, str) and content.strip():
            return content
        # Some servers return plain text under choices[].text
        content2 = choice0.get("text")
        if isinstance(content2, str) and content2.strip():
            return content2
    except Exception as e:
        raise RuntimeError("openai-endpoint-bad-shape") from e

    raise RuntimeError("openai-endpoint-empty-output")

