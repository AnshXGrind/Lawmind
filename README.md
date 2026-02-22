# 🧠 LawMind — AI Legal Drafting Assistant

> **AI-powered legal document generation for Indian lawyers, built on free APIs.**

[![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat-square)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green?style=flat-square)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square)](https://react.dev)
[![Gemini](https://img.shields.io/badge/Gemini-1.5--Flash-orange?style=flat-square)](https://aistudio.google.com)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_DB-purple?style=flat-square)](https://trychroma.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![GSoC](https://img.shields.io/badge/GSoC-Ready-red?style=flat-square)](#gsoc-future-work)
[![CI](https://github.com/AnshXGrind/Lawmind/actions/workflows/ci.yml/badge.svg)](https://github.com/AnshXGrind/Lawmind/actions)
[![HF Space](https://img.shields.io/badge/🤗%20Hugging%20Face-Live%20Demo-yellow?style=flat-square)](https://huggingface.co/spaces/velarixx/lawmind-backend)

> 🚀 **Live API:** https://velarixx-lawmind-backend.hf.space/docs

---

## The Problem

Indian lawyers spend **4–8 hours** drafting a single petition from scratch.
They must manually look up IPC/CrPC sections, format court documents, and cite precedents —
all while juggling 20+ active cases.

## The Solution

LawMind lets a lawyer describe their case in plain English and generates a
**professionally formatted, citation-rich legal document** in seconds.

- ✅ Free AI via **Gemini 1.5 Flash** (no paid API key required)
- ✅ Local vector search via **ChromaDB + Sentence Transformers** (no external service)
- ✅ Covers petitions, contracts, bail applications, notices, affidavits
- ✅ Indian court formatting — Supreme Court down to District Court
- ✅ Suggests relevant IPC, CrPC, CPC, Constitution sections automatically
- ✅ OCR upload for scanned documents (Tesseract + EasyOCR)

---

## Architecture

```
Lawyer Input
     │
     ▼
React Frontend  (Dashboard · New Draft · Editor · Upload)
     │
     ▼
FastAPI Backend
/auth   /drafts   /citations   /documents   /analytics
     │
     ├──────────────────────┐
     ▼                      ▼
RAG Pipeline           Gemini 1.5 Flash
ChromaDB               (free, fast, multilingual)
+ Sentence                   │
  Transformers               ▼
(local embed,          Professional
 no API cost)          Legal Draft
```

---

## Features

| Feature | Status |
|---|---|
| AI draft generation (petition, contract, notice, affidavit) | ✅ Working |
| Court-level selection (District → Supreme Court) | ✅ Working |
| Legal section suggestions (IPC, CrPC, CPC, Constitution) | ✅ Working |
| Document upload & OCR (PDF, image) | ✅ Working |
| Draft editor with split-view and auto-save | ✅ Working |
| PDF / DOCX export | ✅ Working |
| JWT authentication | ✅ Working |
| RAG-powered citation search (ChromaDB) | ✅ Working |
| Professional dark legal SaaS UI | ✅ Working |
| Analytics dashboard | ✅ Working |
| Hindi / regional language support | 🚧 Roadmap |
| Indian Kanoon live citation API | 🚧 Roadmap |
| Collaborative multi-user editing | 🚧 Roadmap |
| Fine-tuned Indian legal LLM | 🚧 Roadmap |

---

## Quick Start — 100% Free

### Prerequisites

- Python 3.11+
- Node.js 18+
- A free Gemini API key from [aistudio.google.com](https://aistudio.google.com/app/apikey)

### 1. Clone

```bash
git clone https://github.com/AnshXGrind/Lawmind.git
cd Lawmind
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Open .env and set:  GEMINI_API_KEY=your_key_here

uvicorn app.main:app --reload --port 8000
```

Swagger UI: http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

App: http://localhost:3000

### 4. Get a Free Gemini API Key

1. Visit https://aistudio.google.com/app/apikey
2. Sign in with Google — no credit card, no billing
3. Click **Create API key**
4. Paste it in `backend/.env` as `GEMINI_API_KEY=your_key`

**Free tier:** 15 requests/min · 1 million tokens/day — more than enough for development.

---

## Docker

```bash
docker-compose up --build
```

Backend → http://localhost:8000 | Frontend → http://localhost:3000

---

## API Reference

Interactive docs: **http://localhost:8000/docs**

| Endpoint | Method | Description |
|---|---|---|
| `/auth/register` | POST | Create account |
| `/auth/login` | POST | Get JWT token |
| `/drafts/` | GET | List drafts |
| `/drafts/` | POST | Generate AI draft |
| `/drafts/{id}` | PUT | Update content |
| `/drafts/{id}` | DELETE | Delete draft |
| `/drafts/suggest-sections` | POST | Auto-suggest IPC/CrPC sections |
| `/documents/upload` | POST | OCR upload (PDF/image) |
| `/citations/search` | GET | Search legal citations |
| `/analytics/summary` | GET | Usage analytics |

---

## Project Structure

```
Lawmind/
├── backend/
│   ├── app/
│   │   ├── core/          # Config, security, database
│   │   ├── models/        # SQLAlchemy + Pydantic schemas
│   │   ├── routers/       # FastAPI route handlers
│   │   └── services/
│   │       ├── ai_service.py      # Gemini 1.5 Flash integration
│   │       ├── rag_service.py     # ChromaDB vector search
│   │       ├── ocr_service.py     # Tesseract / EasyOCR
│   │       └── citation_service.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/    # Sidebar, StatsRow, DraftsTable, QuickDraft …
│   │   ├── pages/         # Dashboard, NewDraft, DraftEditor …
│   │   ├── styles/        # theme.css — LawMind design tokens
│   │   └── utils/         # api.js (Axios instance)
│   └── package.json
├── docker-compose.yml
├── .github/workflows/ci.yml
└── LICENSE
```

---

## GSoC Future Work

LawMind is a strong GSoC candidate — it combines AI, legal accessibility, and Python
infrastructure relevant to millions of Indian litigants and advocates.

1. **Fine-tune on Indian legal corpus** — IPC, CrPC, 50k+ judgements scraped from Indian Kanoon
2. **Hindi & regional language support** — Generate drafts in Hindi, Tamil, Bengali via IndicTrans2
3. **Live citation retrieval** — Real-time Indian Kanoon API integration replacing static ChromaDB seeds
4. **Collaborative editing** — Multi-user real-time draft editing for law firms using Yjs / CRDTs
5. **Voice-to-draft** — Dictate case facts in any Indian language via Whisper / Bhashini API
6. **E-filing integration** — Direct submission to eCourts portal via NJDG API
7. **Document comparison** — Diff drafts against standard court templates
8. **Offline PWA** — Works in courts with poor internet using local quantised Gemma 2B

---

## Contributing

Pull requests are welcome!

1. Fork → create branch: `feat/your-feature` or `fix/bug-name`
2. Python: follow PEP 8, add tests in `backend/tests/`
3. React: follow ESLint config, keep components under `frontend/src/components/`
4. Open PR with a clear description of what changed and why

---

## GitHub Topics

Add these on the repository settings page:

`legal-ai` · `rag` · `fastapi` · `react` · `gemini-api` · `indian-law`
`document-generation` · `nlp` · `python` · `chromadb` · `gsoc` · `langchain`

---

## License

MIT © 2025 LawMind Contributors — see [LICENSE](LICENSE).
