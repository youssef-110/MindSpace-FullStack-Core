import { getResults } from "./storage";

// Only computed numbers and labels ever go to the AI — never individual answers.
export function summarize(r) {
  if (r.type === "traits") return { traits: Object.fromEntries(r.traits.map((t) => [t.name, `${t.score}/50 (${t.band})`])), riskFlag: r.riskFlag };
  if (r.type === "sum") return { score: r.score, max: r.max, band: r.band.level, riskFlag: r.riskFlag };
  if (r.type === "threshold") return { score: r.score, max: r.max, cutoff: r.cutoff, aboveThreshold: r.positive, riskFlag: r.riskFlag };
  if (r.type === "matrix") return { correct: r.correct, total: r.total, practiceEstimate: r.estimate, range90: `${r.low}-${r.high}` };
  return {};
}

// Most recent result for each test, summarized.
export function latestSummaries() {
  const seen = new Set();
  return getResults()
    .filter((e) => !seen.has(e.testId) && seen.add(e.testId))
    .map((e) => ({ testId: e.testId, summary: summarize(e.result) }));
}
