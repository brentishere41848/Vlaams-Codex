# ADR-001 — Gratis LLM via lokaal Ollama endpoint

## Status

Accepted (30 dec 2025)

## Context

We willen een chat‑AI op de website zonder auth, maar **zonder betaalde API**. We moeten:
- lokaal/self-hosted werken (default)
- harde taalgarantie: **altijd** Plat Vlaams, en **weigeren** op andere talen

## Decision

1) **Endpoint**: we praten tegen **Ollama** via:
- `OLLAMA_BASE_URL` + `OLLAMA_MODEL` (aanbevolen)

2) **Taalgarantie**: we doen **buffer + output check** i.p.v. echte streaming:
- We halen de volledige modeloutput op (non-stream).
- We detecteren taal op het eindresultaat.
- Als het niet NL‑achtig is, vervangen we het door een Vlaamse weigering.

De UI simuleert streaming (“fake stream”) door de tekst in stukskes te tonen.

## Consequences

- ✅ Werkt gratis/lokaal (geen betaalde fallback).
- ✅ Hardere garantie dat er geen Engels/Frans “doorlekt”.
- ✅ Simpeler te testen en te debuggen.
- ❌ Geen echte token-streaming van het model (maar UX blijft ok door fake streaming).
