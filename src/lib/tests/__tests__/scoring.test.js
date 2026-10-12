import { describe, it, expect } from "vitest";
import { questionnaires, byId, scoreQuestionnaire } from "../questionnaires";
import { BLUEPRINTS, generateForm, generateItem, scoreMatrix, estimateAbility, cellKey, normalCdf } from "../matrix";

const fill = (q, v) => q.items.map(() => v);

describe("questionnaire catalog", () => {
  it("has the published item counts", () => {
    const counts = { "big-five": 50, "self-esteem": 10, sapas: 8, "msi-bpd": 10, phq9: 9, gad7: 7, pss10: 10, who5: 5, asrs: 6, aq10: 10 };
    for (const [id, n] of Object.entries(counts)) expect(byId(id).items).toHaveLength(n);
  });

  it("every summed scale has bands reaching its max", () => {
    for (const q of questionnaires.filter((x) => x.scoring.type === "sum")) {
      const top = scoreQuestionnaire(q, q.items.map((_, i) => (q.scoring.reverse?.includes(i) ? 0 : Math.max(...q.options.map((o) => o.value)))));
      expect(top.score).toBe(q.scoring.max);
      expect(q.scoring.bands.at(-1).max).toBe(q.scoring.max);
    }
  });

  it("rejects incomplete answers", () => {
    expect(() => scoreQuestionnaire(byId("phq9"), [0, 1])).toThrow();
  });
});

describe("IPIP-50 Big Five", () => {
  const q = byId("big-five");
  it("has 10 items per trait, half reverse-keyed for E, A, C", () => {
    for (const t of ["O", "C", "E", "A", "N"]) expect(q.scoring.keys.filter((k) => k.trait === t)).toHaveLength(10);
    expect(q.scoring.keys.filter((k) => k.trait === "E" && k.sign < 0)).toHaveLength(5);
  });
  it("all-neutral answers give 30 on every trait", () => {
    const r = scoreQuestionnaire(q, fill(q, 3));
    expect(r.traits.every((t) => t.score === 30 && t.band === "mid")).toBe(true);
  });
  it("agreeing with everything does not inflate traits with reverse items", () => {
    const r = scoreQuestionnaire(q, fill(q, 5));
    expect(r.traits.find((t) => t.key === "E").score).toBe(30); // 5 keyed + 5 reversed
  });
  it("max extravert pattern scores 50", () => {
    const answers = q.scoring.keys.map((k) => (k.trait === "E" ? (k.sign > 0 ? 5 : 1) : 3));
    expect(scoreQuestionnaire(q, answers).traits.find((t) => t.key === "E")).toMatchObject({ score: 50, band: "high" });
  });
});

describe("summed scales", () => {
  it("PHQ-9 bands at published cutoffs and flags item 9", () => {
    const q = byId("phq9");
    expect(scoreQuestionnaire(q, [1, 1, 1, 1, 1, 0, 0, 0, 0]).band.level).toBe("Mild"); // 5
    expect(scoreQuestionnaire(q, [2, 2, 2, 2, 2, 0, 0, 0, 0]).band.level).toBe("Moderate"); // 10
    expect(scoreQuestionnaire(q, fill(q, 0)).riskFlag).toBe(false);
    expect(scoreQuestionnaire(q, [0, 0, 0, 0, 0, 0, 0, 0, 1]).riskFlag).toBe(true);
  });
  it("PSS-10 reverse-scores items 4, 5, 7, 8", () => {
    const q = byId("pss10");
    expect(scoreQuestionnaire(q, fill(q, 0)).score).toBe(16); // 4 reversed items × 4
  });
  it("WHO-5 multiplies by 4", () => {
    const q = byId("who5");
    expect(scoreQuestionnaire(q, fill(q, 5)).score).toBe(100);
    expect(scoreQuestionnaire(q, [1, 1, 1, 2, 2]).band.level).toBe("Low"); // 28
  });
  it("Rosenberg reverse-scores negatively worded items", () => {
    const q = byId("self-esteem");
    // "Strongly agree" (3) to everything: 5 positive items × 3 + 5 negative × 0
    expect(scoreQuestionnaire(q, fill(q, 3)).score).toBe(15);
  });
});

describe("threshold screeners", () => {
  it("SAPAS counts 'No' on the trust item", () => {
    const q = byId("sapas");
    expect(scoreQuestionnaire(q, fill(q, 0)).score).toBe(1);
    expect(scoreQuestionnaire(q, [1, 1, 0, 0, 0, 0, 0, 0]).positive).toBe(true); // 3
    expect(scoreQuestionnaire(q, [1, 0, 1, 0, 0, 0, 0, 0]).positive).toBe(false); // 1
  });
  it("MSI-BPD cuts at 7 and flags the self-harm item", () => {
    const q = byId("msi-bpd");
    expect(scoreQuestionnaire(q, [1, 0, 1, 1, 1, 1, 1, 0, 0, 0]).positive).toBe(false); // 6
    expect(scoreQuestionnaire(q, [1, 0, 1, 1, 1, 1, 1, 1, 0, 0]).positive).toBe(true); // 7
    expect(scoreQuestionnaire(q, [0, 1, 0, 0, 0, 0, 0, 0, 0, 0]).riskFlag).toBe(true);
  });
  it("ASRS uses Sometimes+ for items 1-3 and Often+ for items 4-6", () => {
    const q = byId("asrs");
    expect(scoreQuestionnaire(q, fill(q, 2)).score).toBe(3);
    expect(scoreQuestionnaire(q, fill(q, 3)).positive).toBe(true);
  });
  it("AQ-10 scores agreement on 1,7,8,10 and disagreement elsewhere", () => {
    const q = byId("aq10");
    expect(scoreQuestionnaire(q, fill(q, 0)).score).toBe(4);
    expect(scoreQuestionnaire(q, fill(q, 3)).score).toBe(6);
    expect(scoreQuestionnaire(q, [0, 3, 3, 3, 3, 3, 0, 0, 3, 0]).score).toBe(10);
  });
});

describe("matrix generator", () => {
  const form = generateForm(42);

  it("is deterministic for a seed and different across seeds", () => {
    expect(generateForm(42)).toEqual(form);
    expect(cellKey(generateForm(43)[5].cells[2][2])).not.toBe(undefined);
    expect(JSON.stringify(generateForm(43))).not.toBe(JSON.stringify(form));
  });

  it("has 24 items with increasing difficulty", () => {
    expect(form).toHaveLength(24);
    for (let i = 1; i < BLUEPRINTS.length; i++) expect(BLUEPRINTS[i].b).toBeGreaterThan(BLUEPRINTS[i - 1].b);
  });

  for (let seed = 1; seed <= 40; seed++) {
    it(`seed ${seed}: 8 distinct options, exactly one equals the hidden cell, balanced attributes`, () => {
      for (const item of generateForm(seed)) {
        const keys = item.options.map(cellKey);
        expect(new Set(keys).size).toBe(8);
        expect(keys.filter((k) => k === cellKey(item.cells[2][2]))).toHaveLength(1);
        expect(keys[item.correctIndex]).toBe(cellKey(item.cells[2][2]));
        // No attribute value of the answer appears in more than half the options.
        for (const attr of ["shape", "fill", "size", "count", "angle"]) {
          const n = item.options.filter((o) => o[attr] === item.cells[2][2][attr]).length;
          expect(n === 8 || n === 4).toBe(true);
        }
      }
    });
  }

  it("rules hold in every row", () => {
    for (let seed = 1; seed <= 20; seed++) {
      for (const bp of BLUEPRINTS) {
        const { cells } = generateItem(bp, seed);
        for (const [attr, rule] of Object.entries(bp.rules)) {
          for (const row of cells) {
            const v = row.map((c) => c[attr]);
            if (rule === "row") expect(new Set(v).size).toBe(1);
            if (rule === "dist" || rule === "dist-") expect(new Set(v).size).toBe(3);
            if (rule === "add") expect(v[2]).toBe(v[0] + v[1]);
            if (rule === "prog" && attr !== "angle" && attr !== "fill") expect([v[1] - v[0], v[2] - v[1]]).toEqual([1, 1]);
          }
        }
      }
    }
  });
});

describe("matrix scoring", () => {
  const form = generateForm(7);
  it("all correct gives a high estimate, none correct a low one, both finite", () => {
    const all = scoreMatrix(form, form.map((i) => i.correctIndex));
    const none = scoreMatrix(form, form.map((i) => (i.correctIndex + 1) % 8));
    expect(all.correct).toBe(24);
    expect(all.estimate).toBeGreaterThan(130);
    expect(none.estimate).toBeLessThan(70);
    expect(all.low).toBeLessThan(all.estimate);
  });
  it("more correct answers never lowers the estimate", () => {
    let prev = -Infinity;
    for (let k = 0; k <= 24; k++) {
      const answers = form.map((item, i) => (i < k ? item.correctIndex : -1));
      const { estimate } = scoreMatrix(form, answers);
      expect(estimate).toBeGreaterThanOrEqual(prev);
      prev = estimate;
    }
  });
  it("EAP is symmetric around 0 for a symmetric test", () => {
    const { theta } = estimateAbility([{ b: -1, correct: true }, { b: 1, correct: false }]);
    expect(Math.abs(theta)).toBeLessThan(1e-9);
  });
  it("normal CDF is accurate", () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 6);
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 3);
  });
});
