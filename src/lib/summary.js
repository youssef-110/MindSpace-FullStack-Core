import { getResults } from "./storage";

// Only computed numbers and labels ever go to the AI — never individual answers.
export function summarize(r) {
  if (r.type === "traits") {
    // Generic: Big Five and any multi-scale instrument. Results saved before `max`/`level` existed are Big Five (max 50).
    const line = (t) => `${t.score}/${t.max ?? 50} (${t.level ?? t.band}${t.percentile != null ? `, percentile ${t.percentile}` : ""})`;
    return { traits: Object.fromEntries(r.traits.map((t) => [t.name, line(t)])), ...(r.normNote && { normNote: r.normNote }), riskFlag: r.riskFlag };
  }
  if (r.type === "sum") {
    return {
      score: r.score,
      ...(r.min != null && { min: r.min }),
      max: r.max,
      // Cognitive tasks: unit, extra metrics and direction are computed labels, safe to send.
      ...(r.unit && { unit: r.unit }),
      ...(r.lowerIsBetter && { lowerIsBetter: true }),
      ...(r.metrics && { metrics: r.metrics }),
      ...(r.band?.level && { band: r.band.level }),
      ...(r.percentile != null && { percentile: r.percentile }),
      ...(r.normNote && { normNote: r.normNote }),
      riskFlag: r.riskFlag,
    };
  }
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
