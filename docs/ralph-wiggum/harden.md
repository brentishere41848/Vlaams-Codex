# HARDEN — Misbruik, security, observability

## Zonder auth: mitigaties

- **Soft rate limit** op `POST /api/chat` (per IP, per minuut)
  - env: `RATE_LIMIT_PER_MINUTE` of `AI_RATE_LIMIT_PER_MINUTE` (default 30)
  - `0` = uit
- **Max input length**
  - env: `MAX_INPUT_CHARS` of `AI_MAX_INPUT_CHARS` (default 8000)
  - enforced op **totale** chat payload + laatste user message
- **Body size cap** (413) om megabyte payloads te blokkeren

## Security basics

- UI rendert **nooit** raw HTML uit AI output:
  - text via `textContent`
  - code fences worden `pre > code` met `textContent`
- Geen secrets in repo:
  - `.env`, `.env.local`, `.env.*` in `.gitignore`
  - `.env.example` blijft tracked

## Observability / UX

- Server logt beknopt op errors (geen prompt dumps).
- UI toont errors als gewone assistant message + **“Probeer opnieuw”** knop.

