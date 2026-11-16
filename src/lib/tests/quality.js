// Response-quality checks for questionnaires. A score is only as good as the answers behind it,
// so careless patterns are flagged on the result instead of being silently scored.

const FAST_MS = 900; // quicker than anyone can read an item and choose

// answers: chosen option values in item order. timesMs: milliseconds spent on each item.
// reverseKeyed: true when the scale mixes positively and negatively worded items, so one
// identical answer all the way down is contradictory rather than merely consistent.
export function assessQuality({ answers, timesMs = [], reverseKeyed = false }) {
  const n = answers.length;
  const timed = timesMs.filter((t) => Number.isFinite(t));
  const seconds = Math.round(timed.reduce((a, t) => a + t, 0) / 1000);
  const fastShare = timed.length ? timed.filter((t) => t < FAST_MS).length / timed.length : 0;
  let longestRun = n ? 1 : 0;
  for (let i = 1, run = 1; i < n; i++) {
    run = answers[i] === answers[i - 1] ? run + 1 : 1;
    if (run > longestRun) longestRun = run;
  }
  const flags = [];
  if (n >= 5 && timed.length >= n * 0.8 && fastShare >= 0.5) flags.push("speeding");
  if (reverseKeyed && n >= 8 && longestRun >= Math.max(8, Math.ceil(n * 0.8))) flags.push("straightlining");
  return { seconds, fastShare: Math.round(fastShare * 100) / 100, longestRun, flags };
}

export const QUALITY_NOTES = {
  speeding: "You answered most questions in under a second each. That's faster than the items can be read, so treat this score with caution.",
  straightlining: "You gave the same answer to nearly every question, including ones worded in opposite directions. The score may not reflect you.",
};
