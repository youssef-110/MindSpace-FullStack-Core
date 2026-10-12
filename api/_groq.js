// Shared helpers for the serverless functions: Groq calls with timeouts, body parsing,
// a small cache and a best-effort rate limit.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export const model = () => process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
export const hasKey = () => Boolean(process.env.GROQ_API_KEY?.trim());

export function groq(body, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  return fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY.trim()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: model(), temperature: 0.4, ...body }),
    signal: ctrl.signal,
  }).finally(() => clearTimeout(timer));
}

export async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body; // Vercel pre-parses JSON
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 20000) throw new Error("Body too large");
  }
  return JSON.parse(raw || "{}");
}

export function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

// shortcut: in-memory, so it only lives as long as a warm serverless instance; move to KV if traffic grows.
const cache = new Map();
export const cacheGet = (k) => cache.get(k);
export function cacheSet(k, v) {
  if (cache.size > 500) cache.delete(cache.keys().next().value);
  cache.set(k, v);
}

// shortcut: per-instance limiter, not global across instances; use Vercel KV/Upstash for a hard limit.
const hits = new Map();
export function rateLimited(req, max = 30, windowMs = 60_000) {
  // x-real-ip is set by Vercel's edge; the first x-forwarded-for entry can be spoofed by the client.
  const ip = String(req.headers["x-real-ip"] || req.socket?.remoteAddress || "?");
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > max;
}
