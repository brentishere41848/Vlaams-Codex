# VERIFY — Quality gate (30 dec 2025)

## Commands (gerund)

- `python -m venv .venv`
- `. .venv/bin/activate`
- `python -m pip install -e ".[dev]"`
- `pytest -q`
- `python -m build`
- `npm audit --omit=dev`
- `rg -n "TODO|FIXME|console\\.error" src website`

## Resultaten

- Tests: ✅ (21 passed)
- Build: ✅
- npm audit: ✅ (0 vulnerabilities)

## Manual sanity (headless)

- Gedekt via `tests/test_platvlaams_ai_policy.py`:
  - EN input → Vlaamse weigering (zonder model call)
  - VL/NL input → modelpad (stub)
  - Output guard blokkeert niet‑NL output

## Known limitations

- Taaldetectie is **heuristiek** (nl-ish vs other): focust op “andere talen weren”, niet op perfecte dialectherkenning.
- “Offline” melding dekt ook “endpoint draait maar model is verkeerd ingesteld” (zelfde user-facing boodschap).
- De AI‑chat pagina (`/ai/`) werkt best via de lokale server `python -m vlaamscodex.platvlaams_ai.server`; GitHub Pages heeft geen `/api/chat`.
- Op Vercel draait `POST /api/chat` als serverless function (`website/api/chat.js`) en/of via browser-fallback (UI “Instellingen”).
- `OLLAMA_BASE_URL` kan daar niet naar `localhost` wijzen.

## Git

- Branch: `feat/plat-vlaams-only-ai`
- Push: `git push -u origin feat/plat-vlaams-only-ai`
