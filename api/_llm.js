// Shared helpers for the serverless functions: an LLM call with a provider/model fallback
// chain, body parsing, a small cache and a best-effort rate limit.
//
// Gemini models are tried in order through the OpenAI-compatible endpoint; a 429 or timeout on one
// moves to the next. Only providers named in the privacy policy may be added here.

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const DEFAULT_GEMINI = "gemini-3.1-flash-lite,gemini-2.5-flash,gemini-flash-latest";

function chain() {
  const out = [];
  const gemini = process.env.GEMINI_API_KEY?.trim();
  if (gemini) {
    for (const model of (process.env.GEMINI_MODELS || DEFAULT_GEMINI).split(",").map((m) => m.trim()).filter(Boolean)) {
      // Thinking off: these answers are short explanations, and it cuts latency several-fold.
      out.push({ url: GEMINI_URL, key: gemini, model, extra: { reasoning_effort: "none" } });
    }
  }
  return out;
}

export const hasKey = () => chain().length > 0;

// Returns the first OK response (headers received) from the chain, or throws the last error.
export async function llm(body, timeoutMs) {
  let lastError = new Error("No AI provider configured");
  for (const p of chain()) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const r = await fetch(p.url, {
        method: "POST",
        headers: { Authorization: `Bearer ${p.key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: p.model, temperature: 0.4, ...p.extra, ...body }),
        signal: ctrl.signal,
      });
      if (r.ok) {
        // Streams keep reading after we return, so only clear the timer for non-stream calls.
        if (!body.stream) clearTimeout(timer);
        r.model = p.model;
        return r;
      }
      clearTimeout(timer);
      lastError = new Error(`${p.model} ${r.status}`);
      console.warn("[llm]", lastError.message, (await r.text()).slice(0, 200));
    } catch (e) {
      clearTimeout(timer);
      lastError = new Error(`${p.model} ${e.name === "AbortError" ? "timeout" : e.message}`);
      console.warn("[llm]", lastError.message);
    }
  }
  throw lastError;
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

// shortcut: in-memory, so it only lives as long as a warm serverless instance; move to a shared store if traffic grows.
const cache = new Map();
export const cacheGet = (k) => cache.get(k);
export function cacheSet(k, v) {
  if (cache.size > 500) cache.delete(cache.keys().next().value);
  cache.set(k, v);
}

// shortcut: per-instance limiter, not global across instances; use a shared store for a hard limit.
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
