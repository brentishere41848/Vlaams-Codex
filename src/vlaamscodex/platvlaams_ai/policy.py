from __future__ import annotations

from dataclasses import dataclass

from .lang import (
    detect_forbidden_language_request,
    detect_output_language,
    detect_prompt_injection,
    detect_user_language,
)
from .refusal import (
    injection_refusal_message,
    offline_message,
    refusal_message,
    too_long_message,
)


@dataclass(frozen=True)
class ChatResult:
    content: str
    refused: bool
    offline: bool = False


def _last_user_text(messages: list[dict[str, str]]) -> str | None:
    for msg in reversed(messages):
        if msg.get("role") == "user":
            content = msg.get("content") or ""
            if isinstance(content, str) and content.strip():
                return content
    return None


def process_chat(
    *,
    messages: list[dict[str, str]],
    call_model,
    max_input_chars: int = 8000,
) -> ChatResult:
    """
    Enforces the Plat Vlaams-only policy.

    - Blocks non-NL user input (no model call)
    - Blocks prompt injection and language-switch requests (no model call)
    - Buffers model output and blocks non-NL output
    """
    user_text = _last_user_text(messages)
    if user_text is None:
        return ChatResult(content=refusal_message(), refused=True)

    total_chars = sum(len((m.get("content") or "")) for m in messages if isinstance(m.get("content"), str))
    if total_chars > max_input_chars:
        return ChatResult(content=too_long_message(), refused=True)

    if len(user_text) > max_input_chars:
        return ChatResult(content=too_long_message(), refused=True)

    if detect_prompt_injection(user_text):
        return ChatResult(content=injection_refusal_message(), refused=True)

    if detect_forbidden_language_request(user_text):
        return ChatResult(content=refusal_message(), refused=True)

    if detect_user_language(user_text) != "nl":
        return ChatResult(content=refusal_message(), refused=True)

    try:
        model_text = call_model(messages)
    except Exception:
        return ChatResult(content=offline_message(), refused=True, offline=True)

    if detect_output_language(model_text) != "nl":
        return ChatResult(content=refusal_message(), refused=True)

    return ChatResult(content=model_text, refused=False)
