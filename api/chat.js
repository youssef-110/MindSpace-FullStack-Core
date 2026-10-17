// POST /api/chat { messages: [{role, content}], results?: [{testId, summary}] } -> streamed plain text.
// `results` is only sent when the user opts in, and holds computed scores, never answers.
import { CHAT_SYSTEM, resultsContext } from "./_prompts.js";
import { llm, hasKey, readJson, sendJson, rateLimited } from "./_llm.js";
import { takeQuota, quotaHeaders, quotaError } from "./_quota.js";
import { detectCrisis, CRISIS_MESSAGE } from "../src/lib/safety.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Use POST" });
  if (rateLimited(req, 20)) return sendJson(res, 429, { error: "Too many messages. Try again in a minute." });

  let body;
  try {
    body = await readJson(req);
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON" });
  }
  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  const last = messages.at(-1);
  if (!last || last.role !== "user") return sendJson(res, 400, { error: "Send at least one user message" });

  const shared = Array.isArray(body.results)
    ? body.results.filter((x) => x && typeof x === "object" && typeof x.testId === "string" && x.summary && typeof x.summary === "object").slice(0, 15)
    : [];
  const context = JSON.stringify(shared).length <= 4000 ? resultsContext(shared) : "";
  const system = context ? `${CHAT_SYSTEM}

The person chose to share their latest results:
${context}` : CHAT_SYSTEM;

  const crisis = detectCrisis(last.content);
  const q = hasKey() ? await takeQuota(req) : { ok: true, remaining: 0, limit: 0, saver: false };
  if (!q.ok && !crisis) return quotaError(res, q);
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("X-Crisis", crisis ? "1" : "0");
  if (q.ok) quotaHeaders(res, q);
  // Crisis resources are added by code, regardless of what the model says.
  if (crisis) res.write(CRISIS_MESSAGE + "\n\n");
  // Someone in crisis always gets the help lines, even when signed out or out of quota.
  if (!q.ok) {
    res.end(q.reason === "auth" ? "(Sign in to keep talking with the AI.)" : `(${q.message})`);
    return;
  }

  if (!hasKey()) {
    res.end(crisis ? "" : "The AI assistant isn't connected yet. You can still read every lesson and take every test.");
    return;
  }

  let wrote = crisis;
  try {
    const r = await llm({ max_tokens: q.saver ? 450 : 900, stream: true, messages: [{ role: "system", content: system }, ...messages] }, 25000);
    const decoder = new TextDecoder();
    let buffer = "";
    for await (const chunk of r.body) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
        const token = JSON.parse(line.slice(6)).choices?.[0]?.delta?.content;
        if (token) {
          res.write(token);
          wrote = true;
        }
      }
    }
  } catch (e) {
    console.error("[chat]", e.message);
    res.write(`${wrote ? "\n\n" : ""}Sorry, the assistant couldn't answer just now. Please try again in a moment.`);
  }
  res.end();
}
