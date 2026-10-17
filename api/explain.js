// POST /api/explain { testId, summary } -> { summary, points[3], caution, source }
// summary holds only numbers/labels the site already computed.
import { byId } from "../src/lib/tests/questionnaires.js";
import { EXPLAIN_SYSTEM, explainUser } from "./_prompts.js";
import { llm, hasKey, readJson, sendJson, cacheGet, cacheSet, rateLimited } from "./_llm.js";
import { takeQuota, quotaHeaders, quotaError } from "./_quota.js";

const isText = (x, max) => typeof x === "string" && x.trim().length > 0 && x.length <= max;

export default async function handler(req, res) {
  if (req.method !== "POST") return sendJson(res, 405, { error: "Use POST" });
  if (rateLimited(req)) return sendJson(res, 429, { error: "Too many requests. Try again in a minute." });

  let body;
  try {
    body = await readJson(req);
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON" });
  }
  const test = byId(body.testId);
  const summaryJson = JSON.stringify(body.summary ?? null);
  if (!test || !body.summary || summaryJson.length > 2000) return sendJson(res, 400, { error: "Unknown test or bad summary" });
  if (!hasKey()) return sendJson(res, 503, { error: "AI is not configured" });

  const key = `${test.id}:${summaryJson}`;
  const hit = cacheGet(key);
  if (hit) return sendJson(res, 200, { ...hit, cached: true });

  // Cache hits are free; everything else spends one request from the user's daily quota.
  const q = await takeQuota(req);
  if (!q.ok) return quotaError(res, q);
  quotaHeaders(res, q);

  try {
    const r = await llm(
      {
        max_tokens: q.saver ? 450 : 700,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: EXPLAIN_SYSTEM },
          { role: "user", content: explainUser(test, body.summary) },
        ],
      },
      8000
    );
    const data = await r.json();
    // Some models wrap JSON in a code fence despite response_format.
    const out = JSON.parse(data.choices[0].message.content.replace(/^\s*```(?:json)?|```\s*$/g, ""));
    // Enforce the schema; anything else counts as a failure and the client shows its fallback.
    if (!isText(out.summary, 900) || !Array.isArray(out.points) || out.points.length < 1 || !out.points.every((p) => isText(p, 400)) || !isText(out.caution, 400)) {
      throw new Error("Schema mismatch");
    }
    const clean = { summary: out.summary, points: out.points.slice(0, 3), caution: out.caution, model: r.model };
    cacheSet(key, clean);
    return sendJson(res, 200, clean);
  } catch (e) {
    console.error("[explain]", e.message);
    return sendJson(res, 502, { error: "The AI explanation is unavailable right now." });
  }
}
