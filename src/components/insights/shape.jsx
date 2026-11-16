import { byId } from "../../lib/tests/questionnaires";

// Reading saved results without assuming which tests exist. Result shapes:
//   sum       { score, min, max, band: { level, tone, text }, percentile?, unit?, lowerIsBetter? }
//   traits    { traits: [{ key, name, score, min, max, band, level?, tone? }] }
//   threshold { score, max, cutoff, positive }
//   matrix    { estimate, low, high, correct, total }

export const fmtDay = (iso) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
export const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const round = (n) => Math.round(n * 100) / 100;

// The single number a result can be tracked by, or null (trait profiles have none).
export const value = (r) => {
  const v = r.type === "matrix" ? r.estimate : r.type === "traits" ? null : r.score;
  return Number.isFinite(v) ? v : null;
};

// "12 / 27", or "312 ms" when the result carries its own unit.
export const scoreText = (r) => (r.unit ? `${r.score} ${r.unit}` : Number.isFinite(r.max) ? `${r.score} / ${r.max}` : `${r.score}`);

// One line of text for a result, used in the history list.
export function headline(r) {
  if (r.type === "traits") return (r.traits ?? []).map((t) => `${t.key.length > 2 ? t.name : t.key} ${t.score}`).join("  ");
  if (r.type === "sum") return [scoreText(r), r.band?.level].filter(Boolean).join(", ");
  if (r.type === "threshold") return `${r.score} / ${r.max}, ${r.positive ? "at or above threshold" : "below threshold"}`;
  if (r.type === "matrix") return `IQ estimate ${r.estimate} (${r.low} to ${r.high})`;
  return "";
}

// Results whose test no longer exists stay hidden everywhere.
export const visible = (results) => results.filter((e) => byId(e.testId));

// One group per test, newest attempt first, in order of most recent activity.
export function byTest(results) {
  const groups = new Map();
  for (const e of results) groups.set(e.testId, [...(groups.get(e.testId) ?? []), e]);
  return [...groups.values()];
}

// Change between the first and latest attempt. `better` is only claimed when the result says
// which direction is good (lowerIsBetter); otherwise the trend is described, not judged.
export function trend(attempts) {
  const points = [...attempts].reverse().map((e) => value(e.result)).filter((v) => v !== null);
  if (points.length < 2) return null;
  const latest = attempts[0].result;
  const delta = round(points.at(-1) - points[0]);
  const unit = latest.unit ? ` ${latest.unit}` : "";
  const text = delta === 0 ? "No change since your first attempt" : `${delta > 0 ? "Up" : "Down"} ${Math.abs(delta)}${unit} since your first attempt`;
  return { points, text, better: latest.lowerIsBetter === true && delta < 0 };
}
