import { load, save } from "./storage";

// Explanations are cached per (test, result) so reopening a result is instant and free.
export async function explainResult(testId, summary) {
  const key = `${testId}:${JSON.stringify(summary)}`;
  const cache = load("aiCache", {});
  if (cache[key]) return cache[key];

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testId, summary }),
      signal: ctrl.signal,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || "The AI explanation is unavailable right now.");
    const keys = Object.keys(cache);
    if (keys.length > 60) delete cache[keys[0]];
    save("aiCache", { ...cache, [key]: data });
    return data;
  } catch (e) {
    throw new Error(e.name === "AbortError" ? "The AI took too long to answer. Try again." : e.message);
  } finally {
    clearTimeout(timer);
  }
}

export async function streamChat(messages, onText, results) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  try {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, results }),
      signal: ctrl.signal,
    });
    if (!r.ok || !r.body) {
      const data = await r.json().catch(() => ({}));
      throw new Error(data.error || "The assistant is unavailable right now.");
    }
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
    throw new Error(e.name === "AbortError" ? "The assistant took too long to answer. Try again." : e.message);
  } finally {
    clearTimeout(timer);
  }
}
