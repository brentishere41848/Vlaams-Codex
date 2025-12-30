# BUILD — Implementatie-overzicht

## Backend

- Nieuwe module: `src/vlaamscodex/platvlaams_ai/`
  - `lang.py`: lichte detectie “nl-ish” vs “other” + injection/language-request checks
  - `prompt.py`: systeemprompt die “Plat Vlaams‑Only” afdwingt
  - `policy.py`: server-side guard + output guard (buffered)
  - `ollama_client.py`: Ollama call via stdlib `urllib`
  - `server.py`: stdlib webserver (serveert `website/` + `POST /api/chat`)

## Frontend

- Nieuwe pagina: `website/ai/index.html`
- JS client: `website/ai/ai.js`
  - veilige rendering (geen raw HTML)
  - “fake streaming” (typewriter) na volledige response
  - duidelijke offline/limiet/error handling als assistant message

## Config

- `.env.example` met defaults naar localhost + rate limit + max input.
- `.gitignore` negeert `.env*` (behalve `.env.example`).
- Optioneel: `docker-compose.local-llm.yml` (LocalAI skeleton).
- Vercel: `vercel.json` + serverless `api/chat.js` (en fallback `website/api/chat.js` als root directory op `website/` staat).
