# SPEC — Plat Vlaams‑Only AI

## A) UX / UI

- Nieuwe pagina: `website/ai/index.html`
  - Badge: **“Plat Vlaams‑Only”**
  - Disclaimer: **“’t Is Plat Vlaams of ’t is niks.”**
  - Chat UI: simpele thread + input + verzenden.
  - Offline melding (in chat als assistant message): **“AI is offline, start uw lokaal model.”**
  - Optioneel: knop **“Voorbeelden”** die 3 prompts invult (Plat Vlaams).

## B) Backend gedrag (taalpolitie)

We voegen een kleine **lokale dev server** toe (Python stdlib), die:
- Statische files uit `website/` serveert
- Een JSON API route aanbiedt: `POST /api/chat`

### Server-side guard (vóór model call)

- Parse `messages[]` (chat messages format).
- Pak **laatste** `role:"user"` message en run:
  - `detect_user_language(text) -> "nl" | "other"`
  - `detect_prompt_injection(text) -> bool`
  - `detect_forbidden_language_request(text) -> bool`
- Als `other` of injection of “antwoord in Engels/…”:
  - Return **weigering in Plat Vlaams**.
  - **Geen** model call.

### Model call (Ollama, non-stream)

- Request naar `${OLLAMA_BASE_URL}/api/chat`
- `model = OLLAMA_MODEL`
- Systeemprompt dwingt “Plat Vlaams‑Only” af + toonankers (kort).

### Output guard (taalgarantie)

- Buffer volledige modeloutput (non-stream).
- `detect_output_language(text) -> "nl" | "other"`
- Als `other`: vervang door weigering in Plat Vlaams.
- Return JSON naar client.
  - UI doet “fake streaming” (typewriter/chunks) zodat het voelt als streaming.

## C) Gratis endpoint defaults

- `.env.example` (repo root) met defaults naar localhost (Ollama):
  - `OLLAMA_BASE_URL=http://localhost:11434`
  - `OLLAMA_MODEL=llama3.1`
- Geen betaalde fallback. Als Ollama niet bereikbaar is: server antwoordt 503 met code `AI_OFFLINE`.

## D) Tests

- Unit tests:
  - language detection (EN/FR/DE → other, NL/Vlaams → nl)
  - refusal logic (injection/taal-switch verzoek → weigering, zonder model call)
- Route test (logic-level):
  - EN input → Vlaamse weigering (en `call_model` stub wordt niet aangeroepen)
  - NL input → modelpad (met stub) → Vlaams antwoord
  - NL input + stub geeft Engels → output guard → Vlaamse weigering
