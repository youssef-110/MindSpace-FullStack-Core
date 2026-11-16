# MindSpace

Learn how the mind is measured, then measure yours. Short psychology lessons, research-based
self-assessments, and results that say what a score means and what it can't tell you.

**Live site:** https://mindspace-eta-vert.vercel.app

**For education and self-reflection. Not a medical service, and never a diagnosis.**

## What's inside

| Area | What it does |
|---|---|
| **Learn** | 21 lessons (how tests work, Big Five, IQ, personality disorders, mood, trauma, attachment, ADHD, autism, CBT). Each ends with a 3-question check and links to its test. Progress is saved locally. |
| **Tests** | 23 instruments (19 questionnaires, the IQ test and 3 interactive tasks), scored in code (see below). Drafts are saved, so a refresh doesn't lose answers. |
| **Results** | A plain-language result, an "accuracy and limitations" section, the change since your last attempt, a response-quality check that flags rushed or straight-lined answers, print/PDF, and an optional AI explanation. |
| **Insights** | A personal dashboard: latest result per test with trends, lesson progress, rule-based "suggested next", full history, and backup export/import (JSON). |
| **Daily check-in** | A ten-second mood and energy log with streaks and a 30-day chart. Stored on this device only, never uploaded. |
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
| Wellbeing | WHO-5 | ×4 → 0–100; 50 or below reduced wellbeing, 28 or below depression screen |
| Life satisfaction | SWLS (5) | 5–35, the authors' seven bands |
| Loneliness | UCLA 3-item | 3–9, 6 or more read as lonely |
| Resilience | BRS (6) | Mean 1–5, items 2, 4, 6 reversed; below 3.00 low, above 4.30 high |
| Self-efficacy | GSE (10) | 10–40, no reverse items |
| Grit | Grit-S (8) | Mean 1–5, items 1, 3, 5, 6 reversed |
| Adult ADHD | ASRS v1.1 Part A (6) | Items 1–3 count at "Sometimes"+, 4–6 at "Often"+; ≥ 4 |
| Autistic traits | AQ-10 | ≥ 6 |
| Enjoyment of thinking | IPIP Need for Cognition (10, public domain) | 10–50, four items reversed; thirds of the range, no norms |
| Attachment | ECR-R (36) | Two means 1–7 (anxiety, avoidance); 2 and 12 items reversed; descriptive labels, no cut-offs |
| Flourishing | Flourishing Scale (8) | 8–56; descriptive labels, no published cut-offs |
| Trauma reactions | PC-PTSD-5 (public domain) | Entry question, then 0–5; cut-point 4 |
| Reaction time, digit span, Stroop | Interactive tasks | Scored in `cognitive.js`; descriptions, not percentiles |

The Big Five keeps raw-range labels: the IPIP publishes no norms and advises against borrowed ones.

All scoring lives in `src/lib/tests/` (added questionnaires one per file in `src/lib/tests/instruments/`) and is covered by
`src/lib/tests/__tests__/scoring.test.js` and `quality.test.js`.

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
src/lib/tests/  questionnaires.js (items + scoring) · instruments/ (one file per newer scale) · matrix.js (generator + Rasch scoring)
                tasks.js + cognitive.js (interactive tasks and their scoring) · quality.js (response-quality checks)
src/lib/        learn.js · storage.js (local-first) · checkin.js · sync.js (account sync) · supabase.js · ai.js · safety.js · config.js
src/components/ ui.jsx (the design kit) · test/ · tasks/ · insights/ · learn/ · breathe/
src/pages/      Home · Learn · Lesson · Tests · TakeTest · Result · Results (Insights) · CheckIn · Ask · SignIn · Account · Legal · Breathe · Help
docs/           DPIA.md
```

## Design

Twilight editorial: an achromatic page, one blue for actions, a serif for display, and the dusk sky as the
single atmospheric moment. Tokens, the component kit and the motion rules are in `DESIGN.md`.
