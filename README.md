# MindSpace

Learn how the mind is measured, then measure yours. Short psychology lessons, research-based
self-assessments, and results that say what a score means and what it can't tell you.

**For education and self-reflection. Not a medical service, and never a diagnosis.**

## What's inside

| Area | What it does |
|---|---|
| **Learn** | 12 lessons (how tests work, Big Five, IQ, personality disorders, mood, ADHD, autism, CBT). Each ends with a 3-question check and links to its test. Progress is saved locally. |
| **Tests** | 11 instruments, scored in code (see below). Drafts are saved, so a refresh doesn't lose answers. |
| **Results** | A plain-language result, an "accuracy and limitations" section, the change since your last attempt, print/PDF, and an optional AI explanation. |
| **My results** | History, plus backup export/import (JSON). |
| **Ask AI** | A learning assistant for concepts and results. It explains; it never scores or diagnoses. |
| **Breathe / Get help** | Breathing and grounding exercises; crisis lines and how to find a professional. |

### Tests

| Test | Instrument | Scoring |
|---|---|---|
| Big Five personality | IPIP Big-Five Factor Markers (50 items, public domain) | 10–50 per trait, half the items reverse-keyed |
| Self-esteem | Rosenberg (10) | 0–30, items 2, 5, 6, 8, 9 reversed |
| Matrix reasoning | Original generated matrices (24, 20 min) | Rasch/EAP estimate on the IQ scale with a 90% range. **Practice estimate, not a validated IQ.** |
| Personality difficulties | SAPAS (8) | Threshold ≥ 3, trust item reverse-scored |
| Emotional intensity | MSI-BPD (10) | Threshold ≥ 7 |
| Low mood | PHQ-9 | 0–27, standard bands; item 9 shows crisis support first |
| Anxiety | GAD-7 | 0–21, standard bands |
| Stress | PSS-10 | 0–40, items 4, 5, 7, 8 reversed |
| Wellbeing | WHO-5 | ×4 → 0–100 |
| Adult ADHD | ASRS v1.1 Part A (6) | Items 1–3 count at "Sometimes"+, 4–6 at "Often"+; ≥ 4 |
| Autistic traits | AQ-10 | ≥ 6 |

All scoring lives in `src/lib/tests/` and is covered by `src/lib/tests/__tests__/scoring.test.js`.

**Why the matrix test is an estimate.** Each puzzle is generated from a rule blueprint
(constant, progression, distribution-of-three, addition) across shape, count, size, fill and
rotation, so every attempt is a fresh parallel form. The answer set is balanced, so you can't
find the answer by spotting the "most typical" option. Difficulties come from rule complexity,
not from a norm sample, so the result is shown as a range.

## Run locally

```bash
npm install
npm run dev
```

`npm run dev` also serves the `/api` functions. For the AI features, copy `.env.example` to `.env` and add a Gemini key
(free from Google AI Studio):

```
GEMINI_API_KEY=...
GEMINI_MODELS=gemini-3.1-flash-lite,gemini-2.5-flash,gemini-flash-latest   # optional, tried in order
GROQ_API_KEY=...                                                           # optional last fallback
```

Models are tried in order: if one is rate-limited, slow (8 s for explanations) or down, the next takes over.
Measured: explanations ≈ 1.5 s (instant when cached), chat starts streaming in ≈ 0.55 s.
Without any key everything works except the AI explanations and chat, which show a clear fallback.

```bash
npm test        # scoring + safety unit tests
npm run lint
npm run build
```

## Deploy (Vercel)

The repo deploys as-is: Vite builds the static site, and `api/*.js` become serverless functions.
Set `GEMINI_API_KEY` (and optionally `GEMINI_MODELS`, `GROQ_API_KEY`) in the Vercel project's environment variables, then redeploy.

## Architecture

```
api/            explain.js · chat.js (timeouts, JSON schema check, cache, rate limit)
                _prompts.js (every AI prompt, one place) · _llm.js (Gemini → Groq fallback chain)
src/lib/tests/  questionnaires.js (items + scoring) · matrix.js (generator + Rasch scoring)
src/lib/        learn.js (lessons) · storage.js (localStorage) · ai.js (client) · safety.js
src/pages/      Home · Learn · Lesson · Tests · TakeTest · Result · Results · Ask · Breathe · Help
brand/          three logo directions (A in use) — see DESIGN.md
```

## Privacy

There are no accounts and no database. Results, lesson progress and chat history stay in your browser.
"Explain with AI" sends only computed scores, never your answers. Ask AI sends the conversation, plus your latest scores only if you tick "Use my latest results", to Google Gemini.
