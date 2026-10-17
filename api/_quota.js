// AI quota, enforced in the database (supabase ai_take): per-user daily and per-minute limits plus a
// site-wide daily budget, so the AI key's free quota can't run out. Needs the user's own access token.
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "../src/lib/config.js";

const MESSAGES = {
  auth: "Sign in to use the AI. It's free, and it keeps the AI available for everyone.",
  user: "You've used all of today's AI requests. They reset at midnight UTC.",
  burst: "That's a lot of requests in a minute. Wait a moment and try again.",
  global: "The AI has reached its daily limit for the whole site. It resets at midnight UTC. Lessons and tests still work.",
  error: "The AI couldn't check your usage just now. Try again in a moment.",
};

export async function takeQuota(req) {
  const auth = String(req.headers.authorization || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token.length > 4096) return { ok: false, status: 401, reason: "auth", message: MESSAGES.auth };
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/ai_take`, {
      method: "POST",
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(4000),
    });
    if (r.status === 401 || r.status === 403) return { ok: false, status: 401, reason: "auth", message: MESSAGES.auth };
    if (!r.ok) throw new Error(`quota ${r.status}`);
    const q = await r.json();
    if (q.ok) return { ok: true, remaining: q.userRemaining, limit: q.userLimit, saver: q.saver };
    const status = q.reason === "auth" ? 401 : 429;
    return { ok: false, status, reason: q.reason, retryAfter: q.retryAfter, message: MESSAGES[q.reason] ?? MESSAGES.error };
  } catch (e) {
    console.error("[quota]", e.message);
    return { ok: false, status: 503, reason: "error", message: MESSAGES.error };
  }
}

export function quotaHeaders(res, q) {
  res.setHeader("X-AI-Remaining", String(q.remaining));
  res.setHeader("X-AI-Limit", String(q.limit));
  res.setHeader("X-AI-Saver", q.saver ? "1" : "0");
}

export function quotaError(res, q) {
  res.statusCode = q.status;
  res.setHeader("Content-Type", "application/json");
  if (q.retryAfter) res.setHeader("Retry-After", String(q.retryAfter));
  res.end(JSON.stringify({ error: q.message, reason: q.reason }));
}
