import { describe, it, expect } from "vitest";
import { assessments, scoreAssessment, scoreTipi } from "../assessments";

const byId = (id) => assessments.find((a) => a.id === id);

describe("assessment data integrity", () => {
  it("has the standard question counts", () => {
    expect(byId("phq9").questions).toHaveLength(9);
    expect(byId("gad7").questions).toHaveLength(7);
    expect(byId("pss10").questions).toHaveLength(10);
    expect(byId("who5").questions).toHaveLength(5);
    expect(byId("tipi").questions).toHaveLength(10);
  });

  it("every non-personality assessment has bands covering its max score", () => {
    for (const a of assessments.filter((x) => !x.type)) {
      const maxVal = Math.max(...a.options.map((o) => o.value));
      let max = maxVal * a.questions.length;
      if (a.scale) max = a.scale(max);
      expect(a.bands[a.bands.length - 1].max).toBeGreaterThanOrEqual(max);
    }
  });
});

describe("PHQ-9 scoring", () => {
  const phq9 = byId("phq9");

  it("scores all-zero as minimal", () => {
    const r = scoreAssessment(phq9, Array(9).fill(0));
    expect(r.score).toBe(0);
    expect(r.band.level).toBe("Minimal");
    expect(r.riskFlag).toBe(false);
  });

  it("scores all-max as severe with max 27", () => {
    const r = scoreAssessment(phq9, Array(9).fill(3));
    expect(r.score).toBe(27);
    expect(r.maxScore).toBe(27);
    expect(r.band.level).toBe("Severe");
  });

  it("uses standard cutoffs (10 = moderate)", () => {
    const answers = [2, 2, 2, 2, 2, 0, 0, 0, 0]; // score 10
    expect(scoreAssessment(phq9, answers).band.level).toBe("Moderate");
  });

  it("flags any non-zero answer on the self-harm item", () => {
    const answers = Array(9).fill(0);
    answers[8] = 1;
    expect(scoreAssessment(phq9, answers).riskFlag).toBe(true);
  });
});

describe("GAD-7 scoring", () => {
  it("maxes at 21", () => {
    const r = scoreAssessment(byId("gad7"), Array(7).fill(3));
    expect(r.score).toBe(21);
    expect(r.band.level).toBe("Severe");
  });
});

describe("PSS-10 reverse scoring", () => {
  const pss = byId("pss10");

  it("reverse-scores the positively worded items (4,5,7,8)", () => {
    // Answering 'very often' (4) to the positive items should LOWER stress.
    const answers = Array(10).fill(0);
    pss.reverseIndexes.forEach((i) => (answers[i] = 4));
    expect(scoreAssessment(pss, answers).score).toBe(0);
  });

  it("all 'very often' gives mid-range, not max", () => {
    const r = scoreAssessment(pss, Array(10).fill(4));
    expect(r.score).toBe(24); // 6 straight items * 4
    expect(r.maxScore).toBe(40);
  });
});

describe("WHO-5 percentage scaling", () => {
  it("scales raw 0–25 to 0–100", () => {
    const who5 = byId("who5");
    expect(scoreAssessment(who5, Array(5).fill(5)).score).toBe(100);
    expect(scoreAssessment(who5, Array(5).fill(0)).score).toBe(0);
    expect(scoreAssessment(who5, Array(5).fill(0)).band.level).toBe("Low wellbeing");
  });
});

describe("TIPI Big Five scoring", () => {
  it("returns five traits with 0–100 percents", () => {
    const r = scoreTipi([4, 4, 4, 4, 4, 4, 4, 4, 4, 4]);
    expect(r.traits).toHaveLength(5);
    r.traits.forEach((t) => expect(t.percent).toBe(50)); // neutral answers → 50%
  });

  it("reverse-scores correctly (extreme extravert)", () => {
    // Q1 (extraverted)=7, Q6 (reserved, reversed)=1 → extraversion max
    const answers = [7, 4, 4, 4, 4, 1, 4, 4, 4, 4];
    const ext = scoreTipi(answers).traits.find((t) => t.trait === "Extraversion");
    expect(ext.score).toBe(7);
    expect(ext.percent).toBe(100);
  });
});
