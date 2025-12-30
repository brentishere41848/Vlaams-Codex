from __future__ import annotations

import re


_TOKEN_RE = re.compile(r"[a-zà-öø-ÿ]+", re.IGNORECASE)

_NL_HINTS = {
    "de",
    "het",
    "een",
    "en",
    "maar",
    "niet",
    "nie",
    "wa",
    "wat",
    "hoe",
    "waar",
    "waarom",
    "ik",
    "me",
    "mij",
    "mijn",
    "jij",
    "je",
    "jouw",
    "u",
    "uw",
    "gij",
    "ge",
    "gulle",
    "wij",
    "ons",
    "kun",
    "kunt",
    "kan",
    "zal",
    "leg",
    "uit",
    "awel",
    "allee",
    "ziede",
    "da",
    "dat",
    "watte",
    "ne",
    "nen",
    "nene",
    "keer",
    "efkes",
}

_EN_HINTS = {
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "you",
    "your",
    "yours",
    "can",
    "could",
    "would",
    "please",
    "help",
    "hello",
    "hi",
    "thanks",
    "thank",
    "what",
    "how",
    "why",
    "where",
    "here",
    "sure",
    "it",
    "its",
    "this",
    "that",
    "explain",
    "tell",
    "me",
    "about",
    "programming",
    "language",
}

_FR_HINTS = {
    "le",
    "la",
    "les",
    "des",
    "et",
    "ou",
    "mais",
    "vous",
    "tu",
    "je",
    "nous",
    "mon",
    "ma",
    "mes",
    "ton",
    "ta",
    "tes",
    "est",
    "suis",
    "peux",
    "pouvez",
    "bonjour",
    "merci",
    "aide",
    "expliquer",
}

_DE_HINTS = {
    "der",
    "die",
    "das",
    "und",
    "oder",
    "aber",
    "ich",
    "du",
    "sie",
    "wir",
    "mein",
    "meine",
    "bitte",
    "danke",
    "kann",
    "können",
    "erkläre",
    "erklären",
    "hallo",
}


def _tokens(text: str) -> list[str]:
    return [t.lower() for t in _TOKEN_RE.findall(text)]


def detect_user_language(text: str) -> str:
    """
    Very light heuristic: we only need "nl-ish" vs "other".

    Bias: block obvious EN/FR/DE even for short inputs.
    """
    ts = _tokens(text)
    if not ts:
        return "nl"

    nl = sum(1 for t in ts if t in _NL_HINTS)
    en = sum(1 for t in ts if t in _EN_HINTS)
    fr = sum(1 for t in ts if t in _FR_HINTS)
    de = sum(1 for t in ts if t in _DE_HINTS)

    other = max(en, fr, de)

    # Strong non-NL signal.
    if other >= 2 and other >= nl + 1:
        return "other"

    # Short inputs: "hello", "thanks", "bonjour", ...
    if nl == 0 and other >= 1:
        return "other"

    return "nl"


def detect_output_language(text: str) -> str:
    """
    Same deal, but slightly stricter: output should not drift into English.
    """
    ts = _tokens(text)
    if not ts:
        return "nl"

    nl = sum(1 for t in ts if t in _NL_HINTS)
    en = sum(1 for t in ts if t in _EN_HINTS)
    fr = sum(1 for t in ts if t in _FR_HINTS)
    de = sum(1 for t in ts if t in _DE_HINTS)

    other = max(en, fr, de)
    if nl == 0 and other >= 1:
        return "other"
    if other >= 2 and other >= nl + 1:
        return "other"
    if other >= 3 and other >= nl + 2:
        return "other"
    return "nl"


_INJECTION_PATTERNS = [
    "ignore previous instruction",
    "ignore previous instructions",
    "ignore all previous",
    "system prompt",
    "developer message",
    "jailbreak",
    "do anything now",
    "dan mode",
    "prompt injection",
    "override the rules",
    "bypass",
]

_LANGUAGE_REQUEST_PATTERNS = [
    # EN
    "answer in english",
    "respond in english",
    "reply in english",
    "in english",
    # NL
    "antwoord in engels",
    "antwoord in het engels",
    "antwoord in frans",
    "antwoord in het frans",
    "antwoord in duits",
    "antwoord in het duits",
    # FR
    "réponds en anglais",
    "répondre en anglais",
    "réponds en français",
    "répondre en français",
    # DE
    "antworte auf englisch",
    "auf englisch antworten",
    "antworte auf französisch",
]


def detect_prompt_injection(text: str) -> bool:
    low = text.lower()
    return any(p in low for p in _INJECTION_PATTERNS)


def detect_forbidden_language_request(text: str) -> bool:
    low = text.lower()
    return any(p in low for p in _LANGUAGE_REQUEST_PATTERNS)
