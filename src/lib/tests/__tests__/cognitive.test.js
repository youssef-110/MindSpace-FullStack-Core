import { describe, it, expect } from "vitest";
import { median, sd, scoreReactionTime, isCleanRt } from "../cognitive";

const metric = (r, label) => r.metrics.find((m) => m.label === label)?.value;
const rts = (...xs) => xs.map((rt) => ({ rt }));

describe("median and sd", () => {
  it("handles odd, even and empty lists", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([])).toBeNull();
  });
  it("uses the sample standard deviation", () => {
    expect(sd([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 3);
    expect(sd([5])).toBe(0);
  });
});

describe("reaction time", () => {
  it("scores the median of clean rounds", () => {
    const r = scoreReactionTime(rts(250, 300, 270, 260, 290, 280, 310, 240));
    expect(r.score).toBe(275);
    expect(r).toMatchObject({ type: "sum", min: 150, max: 600, unit: "ms", lowerIsBetter: true, riskFlag: false });
    expect(r.band.level).toBe("Typical range");
    expect(metric(r, "Fastest")).toBe("240 ms");
    expect(metric(r, "Slowest")).toBe("310 ms");
    expect(r.percentile).toBeUndefined();
  });

  it("excludes anticipations and lapses, and counts them", () => {
    const r = scoreReactionTime([...rts(60, 200, 210, 220, 1400), { falseStart: true }, { missed: true }]);
    expect(r.score).toBe(210);
    expect(metric(r, "False starts")).toBe("2");
    expect(metric(r, "Missed or too slow")).toBe("2");
    expect(metric(r, "Rounds counted")).toBe("3");
  });

  it("keeps the boundaries inclusive", () => {
    expect(isCleanRt({ rt: 100 })).toBe(true);
    expect(isCleanRt({ rt: 99.9 })).toBe(false);
    expect(isCleanRt({ rt: 1000 })).toBe(true);
    expect(isCleanRt({ rt: 1000.1 })).toBe(false);
    expect(isCleanRt({ missed: true })).toBe(false);
  });

  it("bands by description and never alarms", () => {
    expect(scoreReactionTime(rts(200, 210, 190)).band).toMatchObject({ level: "Faster than typical", tone: "good" });
    expect(scoreReactionTime(rts(400, 410, 390)).band).toMatchObject({ level: "Slower than typical", tone: "ok" });
  });

  it("survives a run with no clean rounds", () => {
    const r = scoreReactionTime([{ falseStart: true }, { missed: true }]);
    expect(r.score).toBe(0);
    expect(r.band.tone).toBe("ok");
    expect(r.metrics.length).toBeGreaterThan(0);
  });
});

import { generateSequence, nextSpanLength, scoreDigitSpan } from "../cognitive";
import { rng } from "../matrix";

const tries = (...xs) => xs.map(([length, correct]) => ({ length, correct }));

describe("digit span", () => {
  it("generates sequences without repeats close together or obvious runs", () => {
    const r = rng(7);
    for (let n = 0; n < 300; n++) {
      const length = 2 + (n % 11);
      const seq = generateSequence(length, r);
      expect(seq).toHaveLength(length);
      seq.forEach((d, i) => {
        expect(Number.isInteger(d) && d >= 0 && d <= 9).toBe(true);
        expect(seq.slice(Math.max(0, i - 5), i)).not.toContain(d);
        if (i >= 2 && Math.abs(seq[i - 1] - seq[i - 2]) === 1) expect(d - seq[i - 1]).not.toBe(seq[i - 1] - seq[i - 2]);
      });
    }
  });

  it("gives two attempts per length and stops after failing both", () => {
    expect(nextSpanLength([])).toBe(3);
    expect(nextSpanLength(tries([3, true]))).toBe(3);
    expect(nextSpanLength(tries([3, true], [3, false]))).toBe(4);
    expect(nextSpanLength(tries([3, false], [3, true]))).toBe(4);
    expect(nextSpanLength(tries([3, true], [3, true], [4, false]))).toBe(4);
    expect(nextSpanLength(tries([3, true], [3, true], [4, false], [4, false]))).toBeNull();
    expect(nextSpanLength(tries([3, false], [3, false]))).toBeNull();
  });

  it("stops at the cap", () => {
    expect(nextSpanLength(tries([12, true], [12, false]))).toBeNull();
    expect(nextSpanLength(tries([11, true], [11, true]))).toBe(12);
  });

  it("scores the longest length recalled correctly", () => {
    const r = scoreDigitSpan(tries([3, true], [3, true], [4, true], [4, false], [5, false], [5, true], [6, false], [6, false]));
    expect(r).toMatchObject({ type: "sum", score: 5, min: 0, max: 12, riskFlag: false, unit: "digits" });
    expect(r.lowerIsBetter).toBeUndefined();
    expect(r.band.level).toBe("Typical range");
    expect(metric(r, "Sequences correct")).toBe("4 of 8");
    expect(metric(r, "Longest attempted")).toBe("6 digits");
  });

  it("handles all wrong and all right", () => {
    const none = scoreDigitSpan(tries([3, false], [3, false]));
    expect(none.score).toBe(0);
    expect(none.band).toMatchObject({ level: "Shorter than typical", tone: "ok" });
    const all = scoreDigitSpan(Array.from({ length: 20 }, (_, i) => ({ length: 3 + (i >> 1), correct: true })));
    expect(all.score).toBe(12);
    expect(all.band).toMatchObject({ level: "Longer than typical", tone: "good" });
  });
});

import { buildStroopTrials, scoreStroop } from "../cognitive";

const stroop = (same, clash, correct = true) => [
  ...same.map((rt) => ({ congruent: true, correct, rt })),
  ...clash.map((rt) => ({ congruent: false, correct, rt })),
];

describe("stroop", () => {
  it("builds a balanced list with no immediate ink repeats", () => {
    const r = rng(11);
    for (let n = 0; n < 50; n++) {
      const list = buildStroopTrials(40, r);
      expect(list).toHaveLength(40);
      expect(list.filter((t) => !t.congruent)).toHaveLength(20);
      list.forEach((t, i) => {
        expect(t.congruent).toBe(t.word === t.ink);
        if (i) expect(t.ink).not.toBe(list[i - 1].ink);
      });
    }
  });

  it("scores interference as conflicting minus matching", () => {
    const r = scoreStroop(stroop([600, 620, 640, 660, 680], [700, 720, 740, 760, 780, 800]));
    expect(r.score).toBe(750 - 640);
    expect(r).toMatchObject({ type: "sum", unit: "ms", lowerIsBetter: true, riskFlag: false });
    expect(r.band.level).toBe("Typical interference");
    expect(metric(r, "Accuracy")).toBe("100%");
    expect(metric(r, "Matching words (median)")).toBe("640 ms");
    expect(metric(r, "Conflicting words (median)")).toBe("750 ms");
  });

  it("keeps the sign when conflicting words were faster", () => {
    const r = scoreStroop(stroop([700, 700, 700, 700, 700], [650, 650, 650, 650, 650]));
    expect(r.score).toBe(-50);
    expect(r.band).toMatchObject({ level: "Little interference", tone: "good" });
  });

  it("ignores errors, anticipations, lapses and timeouts in the medians", () => {
    const trials = [
      ...stroop([600, 600, 600, 600, 600], [700, 700, 700, 700, 700]),
      { congruent: false, correct: false, rt: 5 },
      { congruent: false, correct: true, rt: 40 },
      { congruent: false, correct: true, rt: 3500 },
      { congruent: true, correct: false, rt: null },
    ];
    const r = scoreStroop(trials);
    expect(r.score).toBe(100);
    expect(metric(r, "Accuracy")).toBe("86%");
  });

  it("handles all wrong and flags heavy error rates", () => {
    const none = scoreStroop(stroop([600, 600, 600, 600, 600], [700, 700, 700, 700, 700], false));
    expect(none.score).toBe(0);
    expect(none.band).toMatchObject({ level: "Not enough correct answers", tone: "ok" });
    expect(metric(none, "Accuracy")).toBe("0%");
    expect(scoreStroop([]).band.level).toBe("Not enough correct answers");
    const sloppy = scoreStroop([...stroop([600, 600, 600, 600, 600], [900, 900, 900, 900, 900]), ...stroop([500, 500], [500, 500], false)]);
    expect(sloppy.band.level).toBe("Strong interference");
    expect(sloppy.band.text).toMatch(/errors/);
  });
});

import { tasks } from "../tasks";
import { lessonById } from "../../learn";
import { TASK_COMPONENTS } from "../../../components/tasks";

describe("task catalog", () => {
  it("matches the host contract", () => {
    for (const t of tasks) {
      expect(t).toMatchObject({ category: "cognitive", scoring: { type: "task" } });
      for (const field of ["id", "name", "instrument", "measures", "cannot", "source", "intro"]) expect(typeof t[field]).toBe("string");
      expect(t.minutes).toBeGreaterThan(0);
      expect(t.items).toBeUndefined();
      expect(t.options).toBeUndefined();
      if (t.lesson) expect(lessonById(t.lesson)).toBeTruthy();
      expect(t.cannot).toMatch(/Bluetooth keyboards/);
      expect(t.cannot).toMatch(/caffeine/);
    }
  });

  it("has one component per task", () => {
    expect(Object.keys(TASK_COMPONENTS).sort()).toEqual(tasks.map((t) => t.id).sort());
  });
});
