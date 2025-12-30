# RECON — Plat Vlaams‑Only AI (baseline)

## Huidige repo (high-level)

- **Core**: Python package `vlaamscodex` in `src/vlaamscodex/` (transpiler + CLI).
- **Website**: statische site in `website/` (HTML/CSS/JS), bedoeld voor GitHub Pages.
- **Web tooling (bestaat al)**: `src/vlaamscodex/platsweb/` heeft een kleine Python dev server (stdlib `http.server`) voor `.plats` output + SSE live reload.

## Waar “chat request” nu binnenkomt

- **Nergens**: er is momenteel **geen** chat UI, **geen** `/api/chat`, en **geen** backend die API routes serveert voor de statische website.

## Endpoint config (nu)

- Geen bestaande env vars / config voor LLM endpoints in de repo.

## Streaming vs non-streaming (nu)

- Geen AI calls, dus ook geen streaming gedrag.

## Baseline checks (30 dec 2025)

- **Python build**: `python -m build` ✅
- **Python tests**: `pytest -q` ✅ (17 tests)
- **Lint**: geen standaard lint script/config gevonden (geen `ruff`, `flake8`, `eslint`, …) → n.v.t.

## Risico’s / aandachtspunten (zonder auth)

- **Misbruik**: zonder auth kan `/api/chat` misbruikt worden (spammen / DoS) → rate limit + max input lengte nodig.
- **Prompt injection**: users proberen “ignore instructions / system prompt” → server-side guard nodig vóór model call.
- **Taalgarantie**: model kan toch Engels/French teruggeven → output guard nodig (buffer + taalcheck).
- **Offline lokaal model**: als Ollama niet draait moet UI dit duidelijk zeggen (geen betaalde fallback).
- **XSS**: AI output mag nooit raw HTML in de DOM belanden → escape/safe rendering in de UI.
