# 🌿 MindSpace — your mind deserves a space

A gentle, science-backed mental wellness web app: mood tracking, guided journaling,
validated self-assessments, breathing & grounding exercises, psychoeducation, an
anonymous community wall, and an AI companion grounded in psychology.

**MindSpace is a self-care companion, not a medical service.** It never diagnoses or
treats. Crisis language anywhere in the app (chat, journal, community) triggers a
supportive modal with 24/7 hotlines (988, Crisis Text Line, and international links).

## Features

| Page | What it does |
|---|---|
| **Tracker** | 60-second daily check-ins: mood (1–5), emotion tags, sleep & energy. Trend chart, streaks, monthly calendar. Local-first, optional Firebase sync. |
| **Journal** | Five guided practices: free write, gratitude (3 good things), CBT thought record, unsent letter, worry dump. Stored only in your browser. |
| **Breathe** | Animated calming / box / 4-7-8 breathing and 5-4-3-2-1 sensory grounding. |
| **Assessments** | Clinically validated screeners with plain-language interpretation: PHQ-9, GAD-7, PSS-10, WHO-5, and a TIPI Big Five snapshot. PHQ-9 item 9 triggers crisis support. |
| **Learn** | Bite-sized, evidence-based articles: anxiety, depression, the CBT triangle, sleep, burnout, self-compassion, emotions, how therapy works. |
| **Community** | Anonymous supportive wall with hearts and house rules. |
| **Companion** | AI chat with a counselor-grade system prompt (validate first, CBT/ACT/self-compassion toolkit, safety protocol), RAG over `mindspace-ai/data`, and awareness of your recent check-ins. |
| **Resources** | Crisis lines and everyday paths to real-world support. |

## Quick start

### 1. Frontend (React + Vite + Tailwind v4 + framer-motion)

```bash
npm install
npm run dev          # http://localhost:5173
```

### 2. AI backend (FastAPI)

```bash
pip install -r requirements.txt
cd mindspace-ai
python main.py       # http://localhost:8000
```

The Companion needs one of two model providers (set in `.env`):

- **Ollama (default, free & private):** install from [ollama.com](https://ollama.com), then `ollama pull llama3`.
- **Anthropic Claude (better quality):** paste an `ANTHROPIC_API_KEY` into `.env`.

Optional: `POST /sync` (or nothing — the API runs fine without RAG) re-indexes the
psychology notes in `mindspace-ai/data/` into the Chroma vector store.

### 3. Configuration — `.env`

All keys live in the root `.env` (already templated): `VITE_API_URL`,
`OLLAMA_MODEL`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `AI_TEMPERATURE`,
`CORS_ORIGINS`, and optional `VITE_FIREBASE_*` for tracker cloud sync.
The app works fully offline/local if you set nothing.

## Tests

```bash
npm test                                  # 20 frontend tests (scoring, safety, storage)
cd mindspace-ai && python -m pytest tests # 10 backend tests (crisis detection, prompts)
```

## Architecture

```
src/
  lib/            assessments.js (screeners + scoring) · safety.js (crisis detection)
                  storage.js (local-first persistence)
  components/     Navbar, CrisisModal
  pages/          Home, Tracker, Journal, Breathe, Tests, Learn, Community, Resources, AIAssistant
mindspace-ai/
  main.py         FastAPI app: /chat /sync /health
  prompts.py      Companion system prompt + message assembly
  providers.py    Anthropic Claude or local Ollama, chosen by .env
  safety.py       server-side crisis detection + hotline injection
  brain.py        Chroma RAG over data/*.txt (lazy-loaded, optional)
```

## Privacy

Journals, chats, assessment results, and community posts are stored in
`localStorage` on the user's device. Only mood check-ins are (optionally)
synced to Firebase, and the chat message plus recent mood summary is sent to
your chosen model provider when you talk to the Companion.
