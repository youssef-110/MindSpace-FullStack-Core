// Pure scoring for the interactive cognitive tasks. Each scorer takes the raw trial array and
// returns the stored "sum" result shape. Bands are descriptive (sources are in tasks.js),
// never clinical, and tones stay within good / ok: a slow day is not a health alert.

export const ANTICIPATION_MS = 100; // faster than this is a guess, not a reaction
export const RT_CEILING_MS = 1000; // simple reaction: slower than this is a lapse
export const STROOP_CEILING_MS = 3000;

export function median(xs) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

// Sample standard deviation; 0 when there are fewer than two values.
export function sd(xs) {
  if (xs.length < 2) return 0;
  const mean = xs.reduce((a, x) => a + x, 0) / xs.length;
  return Math.sqrt(xs.reduce((a, x) => a + (x - mean) ** 2, 0) / (xs.length - 1));
}

const ms = (x) => `${Math.round(x)} ms`;
const band = (level, tone, text) => ({ level, tone, text });

// ---------------- Simple reaction time ----------------
// A trial is { rt } for a press after the stimulus, { falseStart: true } for a press before
// it, or { missed: true } when nothing was pressed.

export const isCleanRt = (t) => typeof t.rt === "number" && t.rt >= ANTICIPATION_MS && t.rt <= RT_CEILING_MS;
const isEarly = (t) => Boolean(t.falseStart) || (typeof t.rt === "number" && t.rt < ANTICIPATION_MS);

const RT_NOTE =
  "For comparison only: the Human Benchmark web test reports a median of 273 ms, and a lab study of 1,469 adults measured a mean of 231 ms. Your device adds its own delay.";

export function scoreReactionTime(trials) {
  const clean = trials.filter(isCleanRt).map((t) => t.rt);
  const falseStarts = trials.filter(isEarly).length;
  const lapses = trials.length - clean.length - falseStarts;
  const base = { type: "sum", min: 150, max: 600, riskFlag: false, unit: "ms", lowerIsBetter: true, normNote: RT_NOTE };
  const counts = [
    { label: "False starts", value: String(falseStarts) },
    { label: "Rounds counted", value: String(clean.length) },
  ];
  if (lapses) counts.push({ label: "Missed or too slow", value: String(lapses) });
  if (!clean.length) {
    return { ...base, score: 0, band: band("No clean rounds", "ok", "No round could be timed, so there is no score this time."), metrics: counts };
  }
  const score = Math.round(median(clean));
  const b =
    score <= 220
      ? band("Faster than typical", "good", "Your median was quicker than most results on browser tests, and near what labs record with dedicated hardware.")
      : score <= 330
        ? band("Typical range", "good", "Most people land between about 220 and 330 ms on a browser test like this one. This band is a description, not a percentile.")
        : band("Slower than typical", "ok", "Your median was on the slow side for a browser test. Device delay, a tired day or a careful style can each add this much, so repeat it on the same device before reading anything into it.");
  return {
    ...base,
    score,
    band: b,
    metrics: [
      { label: "Fastest", value: ms(Math.min(...clean)) },
      { label: "Slowest", value: ms(Math.max(...clean)) },
      { label: "Consistency (SD)", value: ms(sd(clean)) },
      ...counts,
    ],
  };
}

// ---------------- Forward digit span ----------------
// An attempt is { length, correct }. Two attempts at each length; the task stops when both
// attempts at one length fail, or after the longest length has been tried.

export const SPAN_START = 3;
export const SPAN_CAP = 12;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// No digit comes back within five places (so never twice in a row), and no run of three
// consecutive numbers such as 3 4 5 or 8 7 6. At least four candidates always remain.
export function generateSequence(length, rand = Math.random) {
  const seq = [];
  while (seq.length < length) {
    const recent = seq.slice(-5);
    const [a, b] = seq.slice(-2);
    const step = seq.length >= 2 && Math.abs(b - a) === 1 ? b - a : null;
    const ok = DIGITS.filter((d) => !recent.includes(d) && (step === null || d !== b + step));
    seq.push(ok[Math.floor(rand() * ok.length)]);
  }
  return seq;
}

// The length to present next, or null when the task is over.
export function nextSpanLength(attempts, { start = SPAN_START, cap = SPAN_CAP } = {}) {
  if (!attempts.length) return start;
  const last = attempts.at(-1).length;
  const here = attempts.filter((a) => a.length === last);
  if (here.length < 2) return last;
  if (!here.some((a) => a.correct)) return null;
  return last >= cap ? null : last + 1;
}

const SPAN_NOTE =
  "For comparison only: in a study of 763 adults who heard digits and repeated them aloud, the longest span averaged between 6 and 7 digits. Seeing and typing digits is not the same task.";

export function scoreDigitSpan(attempts) {
  const right = attempts.filter((a) => a.correct);
  const score = right.length ? Math.max(...right.map((a) => a.length)) : 0;
  const longest = attempts.length ? Math.max(...attempts.map((a) => a.length)) : 0;
  const b =
    score >= 8
      ? band("Longer than typical", "good", "You held more digits in order than most adults do. Grouping digits into chunks is the usual way people get here.")
      : score >= 5
        ? band("Typical range", "good", "Most adults hold between five and seven digits in order, the range George Miller described in 1956. This band is a description, not a percentile.")
        : band("Shorter than typical", "ok", "Your span was below the usual five to seven digits this time. Distraction, tiredness and an unfamiliar keypad all shorten it, so try again when you are settled.");
  return {
    type: "sum",
    score,
    min: 0,
    max: SPAN_CAP,
    band: b,
    riskFlag: false,
    unit: "digits",
    normNote: SPAN_NOTE,
    metrics: [
      { label: "Sequences correct", value: `${right.length} of ${attempts.length}` },
      { label: "Longest attempted", value: `${longest} digits` },
    ],
  };
}

// ---------------- Stroop ----------------
// Colours are indexes 0..3. A trial to show is { word, ink, congruent }; a scored trial is
// { congruent, correct, rt } with rt null when nothing was pressed in time.

export const STROOP_MIN_PER_KIND = 5; // fewer correct, timed trials than this cannot give a median

function shuffled(xs, rand) {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const hasRunOf = (xs, n) => xs.some((_, i) => i + n <= xs.length && xs.slice(i, i + n).every((x) => x === xs[i]));

// Half the trials are incongruent, at most three of a kind come in a row where a shuffle
// allows it, and the ink (so the correct answer) never repeats back to back.
export function buildStroopTrials(n, rand = Math.random) {
  const half = n >> 1;
  const kinds = [...Array(n - half).fill(true), ...Array(half).fill(false)];
  let order = shuffled(kinds, rand);
  for (let i = 0; i < 200 && hasRunOf(order, 4); i++) order = shuffled(kinds, rand);
  let prev = -1;
  return order.map((congruent) => {
    const inks = [0, 1, 2, 3].filter((c) => c !== prev);
    const ink = inks[Math.floor(rand() * inks.length)];
    const words = [0, 1, 2, 3].filter((c) => c !== ink);
    prev = ink;
    return { word: congruent ? ink : words[Math.floor(rand() * words.length)], ink, congruent };
  });
}

const STROOP_NOTE =
  "There are no agreed norms for a four-button browser version, so the band is a description. In lab studies one person's interference score shifts noticeably between sessions.";

export function scoreStroop(trials) {
  const timed = (congruent) =>
    trials.filter((t) => t.congruent === congruent && t.correct && typeof t.rt === "number" && t.rt >= ANTICIPATION_MS && t.rt <= STROOP_CEILING_MS).map((t) => t.rt);
  const same = timed(true);
  const clash = timed(false);
  const accuracy = trials.length ? trials.filter((t) => t.correct).length / trials.length : 0;
  const base = { type: "sum", min: 0, max: 300, riskFlag: false, unit: "ms", lowerIsBetter: true, normNote: STROOP_NOTE };
  const metrics = [{ label: "Accuracy", value: `${Math.round(accuracy * 100)}%` }];
  if (same.length < STROOP_MIN_PER_KIND || clash.length < STROOP_MIN_PER_KIND) {
    return { ...base, score: 0, band: band("Not enough correct answers", "ok", "Too few answers were correct and in time to compare the two kinds of word, so there is no interference score this time."), metrics };
  }
  const [a, b] = [median(same), median(clash)];
  const score = Math.round(b - a);
  const careless = accuracy < 0.8 ? " You also made quite a few errors, which makes the timing less trustworthy." : "";
  const chosen =
    score <= 30
      ? band("Little interference", "good", "Conflicting words barely slowed you down in this run.")
      : score <= 150
        ? band("Typical interference", "good", "Conflicting words slowed you by a familiar amount. Reading is automatic, so almost everyone shows this effect.")
        : band("Strong interference", "ok", "Conflicting words slowed you more than usual in this run. That is common on a first try and usually shrinks with practice.");
  return {
    ...base,
    score,
    band: { ...chosen, text: chosen.text + careless },
    metrics: [...metrics, { label: "Matching words (median)", value: ms(a) }, { label: "Conflicting words (median)", value: ms(b) }],
  };
}
