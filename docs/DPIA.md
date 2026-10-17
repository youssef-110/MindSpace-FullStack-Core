# Data protection impact assessment (GDPR Art. 35)

Status: draft for the operator to review and sign before public launch. Review again when processing changes
(new provider, new data, paid AI tier, analytics changes).

## 1. Processing described

| Processing | Data | Subjects | Where | Legal basis |
|---|---|---|---|---|
| Account | Email, password hash (Supabase Auth), sign-in times | Users 16+ | Supabase, EU (Frankfurt) | Art. 6(1)(b) |
| Lesson progress | Best quiz score per lesson | Account holders | Supabase EU | Art. 6(1)(b) |
| Stored test results (opt-in) | Scores and labels from PHQ-9, GAD-7, SAPAS, MSI-BPD, ASRS, AQ-10, wellbeing and personality scales | Account holders who tick explicit consent | Supabase EU | Art. 6(1)(a) + 9(2)(a) |
| AI requests (opt-in) | User questions; computed scores the user chooses to send | Account holders who tick AI consent | Google Gemini API (USA) | Art. 6(1)(a)/(b) + 9(2)(a) |
| AI quota counters | Requests per user per day | Account holders | Supabase EU, deleted after 30 days (pg_cron) | Art. 6(1)(f) |
| Visitor statistics | Aggregated page views, no cookies | All visitors | Vercel Web Analytics | Art. 6(1)(f) |
| Local-only data | Answers, results, chats, drafts | All visitors | The user's browser only | Not processed by the operator |

Why a DPIA: special-category (health-related) data, potentially vulnerable users, and a novel technology (LLM).
That meets at least three WP248 criteria.

## 2. Necessity and proportionality

- Everything works without an account; server-side storage is optional and off by default.
- Individual answers never leave the device. Only computed scores are stored or sent to the AI.
- Health data is stored only after a separate, unticked consent checkbox. Withdrawal deletes it immediately.
- AI needs sign-in, has per-user and site-wide daily caps, and asks for consent per request for health-related scores.
- No advertising, no tracking cookies, no profiling, no sale of data. Fonts are self-hosted.

## 3. Risks and measures

| Risk | Likelihood / impact | Measures |
|---|---|---|
| Unauthorised access to another user's results | Low / high | Row-level security on every table, own-row policies only; anon role has no table privileges; SECURITY DEFINER functions with fixed search_path; verified by tests on 2026-10-17 |
| Account takeover | Low / high | Supabase Auth password hashing, rate limits; min. 8-character passwords; recommend enabling leaked-password protection and CAPTCHA |
| Health scores reused by the AI provider | Medium / medium | Only scores (no answers, name or email) are sent; explicit consent; **move the Gemini key to the paid tier** so Google acts as processor under its data processing terms |
| Harm from misreading results (vulnerable users) | Medium / high | Research cut-offs described neutrally; limitations on every result; crisis resources shown before scores when self-harm items are endorsed and in chat regardless of quota |
| AI produces harmful or diagnostic content | Medium / medium | System prompt forbids diagnosis and score changes; crisis text added by code, not the model; output schema validation for explanations |
| Data left on shared devices | Medium / medium | "Sign out and clear this device" option; data stays in localStorage only |
| International transfers | Medium / low | Supabase data in the EU; Vercel and Google under the EU-US Data Privacy Framework; SCCs |
| Service abuse exhausting AI quota | Medium / low | Per-user daily and per-minute caps, site-wide cap with reduced-length "saver" mode at 80%; anonymous sessions rejected |

## 4. Residual risk

Acceptable once the open actions below are done. Consult the supervisory authority (Art. 36) only if a high
residual risk remains.

## 5. Open actions before launch

1. Fill in the operator identity and a working contact address (`src/lib/config.js`: `OPERATOR`, `CONTACT_EMAIL`).
2. Enable billing on the Google Cloud project behind `GEMINI_API_KEY` (Gemini API paid tier) and accept Google's data processing terms.
3. Supabase Auth: set Site URL and redirect URLs to the production domain; configure custom SMTP or keep email confirmation on with an acceptable send limit; enable CAPTCHA and leaked-password protection.
4. Accept Vercel's and Supabase's data processing agreements in their dashboards.
5. Record this DPIA with the date and the operator's sign-off.
