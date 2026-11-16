import { describe, it, expect } from "vitest";
import { assessQuality, QUALITY_NOTES } from "../quality";

const times = (n, ms) => Array(n).fill(ms);
const varied = (n) => Array.from({ length: n }, (_, i) => i % 4);

describe("assessQuality: speeding", () => {
  it("flags when at least half the timed answers are under 900 ms", () => {
    const r = assessQuality({ answers: varied(10), timesMs: [...times(5, 500), ...times(5, 3000)] });
    expect(r.flags).toEqual(["speeding"]);
    expect(r.fastShare).toBe(0.5);
    expect(r.seconds).toBe(18); // 2.5 s + 15 s, rounded
  });
  it("does not flag just under half, or answers at exactly 900 ms", () => {
    expect(assessQuality({ answers: varied(10), timesMs: [...times(4, 500), ...times(6, 3000)] }).flags).toEqual([]);
    expect(assessQuality({ answers: varied(10), timesMs: times(10, 900) })).toMatchObject({ flags: [], fastShare: 0 });
    expect(assessQuality({ answers: varied(10), timesMs: times(10, 899) }).flags).toEqual(["speeding"]);
  });
  it("needs at least 5 items", () => {
    expect(assessQuality({ answers: varied(4), timesMs: times(4, 100) }).flags).toEqual([]);
    expect(assessQuality({ answers: varied(5), timesMs: times(5, 100) }).flags).toEqual(["speeding"]);
  });
});

describe("assessQuality: missing times", () => {
  it("returns zeros and no flags when no times were recorded", () => {
    expect(assessQuality({ answers: varied(10) })).toEqual({ seconds: 0, fastShare: 0, longestRun: 1, flags: [] });
  });
  it("ignores non-finite times and needs times for 80% of items before judging speed", () => {
    const gaps = [...times(7, 100), null, undefined, NaN];
    expect(assessQuality({ answers: varied(10), timesMs: gaps })).toMatchObject({ flags: [], fastShare: 1, seconds: 1 });
    expect(assessQuality({ answers: varied(10), timesMs: [...times(8, 100), null, NaN] }).flags).toEqual(["speeding"]);
  });
});

describe("assessQuality: straight-lining", () => {
  it("flags one identical answer throughout only when the scale mixes item directions", () => {
    const same = Array(10).fill(2);
    expect(assessQuality({ answers: same, reverseKeyed: true })).toMatchObject({ flags: ["straightlining"], longestRun: 10 });
    expect(assessQuality({ answers: same, reverseKeyed: false })).toMatchObject({ flags: [], longestRun: 10 });
    expect(assessQuality({ answers: same }).flags).toEqual([]);
  });
  it("uses the longest run: at least 8 and at least 80% of the items", () => {
    const run = (n, len) => [...Array(len).fill(1), ...Array.from({ length: n - len }, (_, i) => (i % 2 ? 1 : 3))];
    expect(assessQuality({ answers: run(10, 8), reverseKeyed: true }).flags).toEqual(["straightlining"]);
    expect(assessQuality({ answers: run(10, 7), reverseKeyed: true })).toMatchObject({ flags: [], longestRun: 7 });
    expect(assessQuality({ answers: run(50, 39), reverseKeyed: true }).flags).toEqual([]);
    expect(assessQuality({ answers: run(50, 40), reverseKeyed: true }).flags).toEqual(["straightlining"]);
  });
  it("finds a run in the middle and resets after a different answer", () => {
    expect(assessQuality({ answers: [0, 1, 1, 1, 0, 1, 1] }).longestRun).toBe(3);
  });
});

describe("assessQuality: short scales", () => {
  it("never flags straight-lining under 8 items", () => {
    expect(assessQuality({ answers: Array(7).fill(1), reverseKeyed: true })).toMatchObject({ flags: [], longestRun: 7 });
    expect(assessQuality({ answers: Array(8).fill(1), reverseKeyed: true }).flags).toEqual(["straightlining"]);
  });
  it("handles empty and single-answer input", () => {
    expect(assessQuality({ answers: [] })).toEqual({ seconds: 0, fastShare: 0, longestRun: 0, flags: [] });
    expect(assessQuality({ answers: [3] }).longestRun).toBe(1);
  });
  it("can raise both flags, and every flag has a note", () => {
    const r = assessQuality({ answers: Array(10).fill(0), timesMs: times(10, 200), reverseKeyed: true });
    expect(r.flags).toEqual(["speeding", "straightlining"]);
    for (const f of r.flags) expect(QUALITY_NOTES[f]).toBeTruthy();
  });
});
