---
title: LawMind Legal AI
emoji: ⚖️
colorFrom: indigo
colorTo: purple
sdk: docker
pinned: false
license: mit
app_port: 7860
short_description: AI Legal Drafting Assistant for Indian Courts — FastAPI + Gemini
---

# ⚖️ LawMind — AI Legal Drafting Assistant

FastAPI backend for LawMind. Generates professionally formatted Indian court documents using Google Gemini.

## API Endpoints
- `GET /health` — Health check (shows Gemini key status)
- `GET /ping` — Keepalive ping
- `GET /docs` — Swagger UI
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login (returns JWT)
- `POST /api/drafts/generate` — Generate legal draft
- `GET /api/drafts/` — List drafts

## Required Secrets (Settings → Variables and secrets)
| Key | Description |
|-----|-------------|
| `GEMINI_API_KEY` | From https://aistudio.google.com |
| `SECRET_KEY` | Any random string for JWT |
| `CORS_ORIGINS` | `["https://your-frontend.vercel.app"]` |
