# SLICE — Kleinste end‑to‑end bewijs

## Doel

Bewijzen dat:
1) De site start lokaal
2) De chat UI bestaat
3) Engels → **weigering** (zonder model call)
4) Vlaams → **modelpad** (met model call)

## Wat er nu is (vertical slice)

- Chat UI: `website/ai/index.html` + `website/ai/ai.js`
- API: `POST /api/chat` via `python -m vlaamscodex.platvlaams_ai.server`
- Policy tests (golden checks): `tests/test_platvlaams_ai_policy.py`

## Manual slice stappen

1) Start server:
   - `python -m vlaamscodex.platvlaams_ai.server`
2) Open:
   - `http://127.0.0.1:5174/ai/`
3) Typ:
   - “Hello, can you help?” → krijgt Vlaamse weigering (zonder model)
4) Typ:
   - “Awel, leg ne keer uit wa Plats is” → gaat naar lokaal model (als endpoint draait) en antwoordt in Plat Vlaams

