# MindSpace

Learn how the mind is measured, then measure yours. Short psychology lessons, research-based
self-assessments, and results that say what a score means and what it can't tell you.

**Live site:** https://mindspace-eta-vert.vercel.app

**For education and self-reflection. Not a medical service, and never a diagnosis.**

## What's inside

| Area | What it does |
|---|---|
| **Learn** | 20 lessons (how tests work, Big Five, IQ, personality disorders, mood, ADHD, autism, CBT). Each ends with a 3-question check and links to its test. Progress is saved locally. |
| **Tests** | 16 instruments, scored in code (see below). Drafts are saved, so a refresh doesn't lose answers. |
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

`npm run dev` also serves the `/api` functions. Put `GEMINI_API_KEY` in `.env` (see `.env.example`) for the AI.

```bash
npm test        # scoring and safety unit tests
npm run lint
npm run build
```

## Accounts, data and AI limits

- **Supabase** (EU, Frankfurt) handles sign-in and stores lesson progress, and test results only with explicit consent.
  Every table has row-level security; the publishable key in `src/lib/config.js` is public by design.
- **AI quota** is enforced in the database (`ai_take()`): per-user daily and per-minute limits plus a site-wide daily budget.
  At 80% of the budget the AI switches to shorter answers and users see a notice; at 100% it pauses until midnight UTC.
  Change limits with SQL: `update public.ai_settings set user_daily = 25, user_per_minute = 6, global_daily = 900;`
- **Analytics**: Vercel Web Analytics (cookieless). Turn it on in Vercel: project, Analytics tab, Enable.
- **Legal**: privacy policy, terms and imprint live in `src/pages/Legal.jsx`. The DPIA and launch checklist are in `docs/DPIA.md`.

## Deploy (Vercel)

Vite builds the static site and `api/*.js` become serverless functions. Set `GEMINI_API_KEY` (and optionally
`GEMINI_MODELS`) in the Vercel project's environment variables. Security headers and the CSP are in `vercel.json`.

## Architecture

```
api/            explain.js · chat.js · _quota.js (DB-enforced limits) · _llm.js (Gemini model chain) · _prompts.js
src/lib/tests/  questionnaires.js (items + scoring) · matrix.js (generator + Rasch scoring)
src/lib/        learn.js · storage.js (local-first) · sync.js (account sync) · supabase.js · ai.js · safety.js · config.js
src/pages/      Home · Learn · Lesson · Tests · TakeTest · Result · Results · Ask · SignIn · Account · Legal · Breathe · Help
docs/           DPIA.md
```
