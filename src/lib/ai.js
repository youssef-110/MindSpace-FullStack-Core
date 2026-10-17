import { load, save } from "./storage";
import { supabase, accessToken } from "./supabase";

// Errors carry the server's reason ("auth" | "user" | "burst" | "global" | ...) so the UI can respond.
export class AiError extends Error {
  constructor(message, reason) {
    super(message);
    this.reason = reason;
  }
}

const quotaFrom = (r) =>
  r.headers.get("X-AI-Limit") ? { remaining: Number(r.headers.get("X-AI-Remaining")), limit: Number(r.headers.get("X-AI-Limit")), saver: r.headers.get("X-AI-Saver") === "1" } : null;

// Tell listeners (the quota badge) about fresh numbers without another round trip.
const announce = (quota) => quota && window.dispatchEvent(new CustomEvent("mindspace:ai-quota", { detail: quota }));

async function headers() {
  const token = await accessToken();
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function failure(r) {
  const data = await r.json().catch(() => ({}));
  return new AiError(data.error || "The AI is unavailable right now.", data.reason || (r.status === 401 ? "auth" : "error"));
}

// Explanations are cached per (test, result) so reopening a result is instant and doesn't use quota.
export async function explainResult(testId, summary) {
  const key = `${testId}:${JSON.stringify(summary)}`;
  const cache = load("aiCache", {});
  if (cache[key]) return { ...cache[key], cached: true };

  try {
    const r = await fetch("/api/explain", { method: "POST", headers: await headers(), body: JSON.stringify({ testId, summary }), signal: AbortSignal.timeout(20000) });
    if (!r.ok) throw await failure(r);
    announce(quotaFrom(r));
    const data = await r.json();
    const keys = Object.keys(cache);
    if (keys.length > 60) delete cache[keys[0]];
    save("aiCache", { ...cache, [key]: data });
    return data;
  } catch (e) {
    if (e instanceof AiError) throw e;
    throw new AiError(e.name === "TimeoutError" ? "The AI took too long to answer. Try again." : "Couldn't reach the AI. Check your connection.", "network");
  }
}

export async function streamChat(messages, onText, results) {
  try {
    const r = await fetch("/api/chat", { method: "POST", headers: await headers(), body: JSON.stringify({ messages, results }), signal: AbortSignal.timeout(40000) });
    if (!r.ok || !r.body) throw await failure(r);
    announce(quotaFrom(r));
    const crisis = r.headers.get("X-Crisis") === "1";
    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      onText(text);
    }
    return { text, crisis };
  } catch (e) {
    if (e instanceof AiError) throw e;
    throw new AiError(e.name === "TimeoutError" ? "The assistant took too long to answer. Try again." : "Couldn't reach the assistant. Check your connection.", "network");
  }
}

export async function aiStatus() {
  const { data, error } = await supabase.rpc("ai_status");
  if (error) throw error;
  return data;
}
