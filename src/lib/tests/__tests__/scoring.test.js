import { describe, it, expect } from "vitest";
import { questionnaires, byId, scoreQuestionnaire, CATEGORIES } from "../questionnaires";
import { lessons, lessonById } from "../../learn";
import { summarize } from "../../summary";
import { BLUEPRINTS, generateForm, generateItem, scoreMatrix, estimateAbility, cellKey, normalCdf } from "../matrix";

const fill = (q, v) => q.items.map(() => v);

describe("questionnaire catalog", () => {
  it("has the published item counts", () => {
    const counts = { "big-five": 50, "self-esteem": 10, sapas: 8, "msi-bpd": 10, phq9: 9, gad7: 7, pss10: 10, who5: 5, asrs: 6, aq10: 10, swls: 5, loneliness: 3, resilience: 6, "self-efficacy": 10, grit: 8, "need-for-cognition": 10, "ecr-r": 36, flourishing: 8, "pc-ptsd-5": 6 };
    for (const [id, n] of Object.entries(counts)) expect(byId(id).items).toHaveLength(n);
    // Every questionnaire is in the table above, except the matrix test whose items are generated.
    const withItems = questionnaires.filter((q) => Array.isArray(q.items) && q.scoring.type !== "matrix").map((q) => q.id);
    expect(withItems.sort()).toEqual(Object.keys(counts).sort());
  });

  it("has unique ids, known categories and existing lessons", () => {
    const ids = questionnaires.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of questionnaires) {
      expect(CATEGORIES.some((c) => c.id === q.category), `${q.id} category`).toBe(true);
      // Questionnaires must link a lesson; interactive tasks may leave it out.
      if (q.items) expect(q.lesson, `${q.id} lesson`).toBeTruthy();
      if (q.lesson) expect(lessonById(q.lesson), `${q.id} lesson`).toBeTruthy();
    }
    for (const l of lessons) {
      if (l.test) expect(byId(l.test), `${l.id} test link`).toBeTruthy();
      expect(l.quiz).toHaveLength(3);
    }
  });

  it("every option list has distinct values and every scored item has text", () => {
    for (const q of questionnaires.filter((x) => x.options)) {
      expect(new Set(q.options.map((o) => o.value)).size).toBe(q.options.length);
      expect(q.items.every((t) => typeof t === "string" && t.length > 0)).toBe(true);
    }
  });

  it("refuses to score an interactive task as a questionnaire", () => {
    for (const t of questionnaires.filter((x) => !x.items)) expect(() => scoreQuestionnaire(t, [])).toThrow();
  });

  it("every summed scale has bands reaching its max", () => {
    for (const q of questionnaires.filter((x) => x.scoring.type === "sum")) {
      const vals = q.options.map((o) => o.value);
      const top = scoreQuestionnaire(q, q.items.map((_, i) => (q.scoring.reverse?.includes(i) ? Math.min(...vals) : Math.max(...vals))));
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

describe("added scales", () => {
  it("SWLS sums 5-35 with Pavot & Diener bands", () => {
    const q = byId("swls");
    expect(scoreQuestionnaire(q, fill(q, 1))).toMatchObject({ score: 5, band: { level: "Extremely dissatisfied" } });
    expect(scoreQuestionnaire(q, fill(q, 4)).band.level).toBe("Neutral"); // 20
    expect(scoreQuestionnaire(q, fill(q, 5)).band.level).toBe("Slightly satisfied"); // 25
  });
  it("UCLA-3 flags loneliness at 6+", () => {
    const q = byId("loneliness");
    expect(scoreQuestionnaire(q, [2, 2, 1]).band.level).toBe("Not lonely"); // 5
    expect(scoreQuestionnaire(q, [2, 2, 2]).band.level).toBe("Lonely"); // 6
  });
  it("BRS reverse-scores items 2, 4, 6 and averages", () => {
    const q = byId("resilience");
    expect(scoreQuestionnaire(q, [5, 1, 5, 1, 5, 1])).toMatchObject({ score: 5, band: { level: "High resilience" } });
    expect(scoreQuestionnaire(q, fill(q, 3)).score).toBe(3);
    expect(scoreQuestionnaire(q, [3, 3, 3, 3, 3, 4]).band.level).toBe("Low resilience"); // 2.83
  });
  it("Grit-S reverse-scores the interest items", () => {
    const q = byId("grit");
    // "Very much like me" (5) to everything: 4 effort items 5, 4 interest items 1 -> mean 3
    expect(scoreQuestionnaire(q, fill(q, 5)).score).toBe(3);
    expect(scoreQuestionnaire(q, [1, 5, 1, 5, 1, 1, 5, 5]).score).toBe(5);
  });
  it("GSE sums 10-40", () => {
    const q = byId("self-efficacy");
    expect(scoreQuestionnaire(q, fill(q, 3)).score).toBe(30);
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

// Builds answers whose keyed total is `total` (before any multiplier), respecting reverse keys and gates.
const answersFor = (q, total) => {
  const vals = q.options.map((o) => o.value);
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const s = q.scoring;
  let need = total - (q.items.length - (s.gate === undefined ? 0 : 1)) * lo;
  const out = q.items.map((_, i) => {
    if (i === s.gate) return 1;
    const add = Math.min(hi - lo, need);
    need -= add;
    return s.reverse?.includes(i) ? hi - add : lo + add;
  });
  if (need !== 0) throw new Error(`${q.id}: total ${total} is out of range`);
  return out;
};

// [id, [keyed total, expected level] on both sides of every band edge]
const EDGES = {
  "self-esteem": [[14, "Lower self-esteem"], [15, "Typical range"], [25, "Typical range"], [26, "High self-esteem"]],
  phq9: [[4, "Minimal"], [5, "Mild"], [9, "Mild"], [10, "Moderate"], [14, "Moderate"], [15, "Moderately severe"], [19, "Moderately severe"], [20, "Severe"]],
  gad7: [[4, "Minimal"], [5, "Mild"], [9, "Mild"], [10, "Moderate"], [14, "Moderate"], [15, "Severe"]],
  pss10: [[13, "Low"], [14, "Moderate"], [26, "Moderate"], [27, "High"]],
  who5: [[7, "Low"], [8, "50 or below"], [12, "50 or below"], [13, "Good"]], // raw 7 = 28, 12 = 48, 13 = 52
  swls: [[9, "Extremely dissatisfied"], [10, "Dissatisfied"], [14, "Dissatisfied"], [15, "Slightly dissatisfied"], [19, "Slightly dissatisfied"], [20, "Neutral"], [21, "Slightly satisfied"], [25, "Slightly satisfied"], [26, "Satisfied"], [30, "Satisfied"], [31, "Extremely satisfied"]],
  loneliness: [[5, "Not lonely"], [6, "Lonely"]],
  resilience: [[17, "Low resilience"], [18, "Normal resilience"], [25, "Normal resilience"], [26, "High resilience"]], // means 2.83, 3.00, 4.17, 4.33
  "self-efficacy": [[24, "Below average"], [25, "Around average"], [33, "Around average"], [34, "High"]],
  grit: [[19, "Lower grit"], [20, "Moderate grit"], [29, "Moderate grit"], [30, "High grit"]], // means 2.38, 2.50, 3.63, 3.75
  "need-for-cognition": [[23, "Lower third of the range"], [24, "Middle third of the range"], [36, "Middle third of the range"], [37, "Upper third of the range"]],
  flourishing: [[31, "Mostly disagreeing"], [32, "Mixed to agreeing"], [47, "Mixed to agreeing"], [48, "Agreeing throughout"]],
  "pc-ptsd-5": [[3, "Below the screening cut-point"], [4, "At or above the screening cut-point"]],
};

describe("every summed or averaged scale", () => {
  const scales = questionnaires.filter((q) => q.items && ["sum", "mean"].includes(q.scoring.type));

  it("has its band edges covered here", () => {
    expect(scales.map((q) => q.id).sort()).toEqual(Object.keys(EDGES).sort());
  });

  for (const q of scales) {
    const s = q.scoring;
    const vals = q.options.map((o) => o.value);
    const n = q.items.length - (s.gate === undefined ? 0 : 1);
    const toScore = (total) => (s.type === "mean" ? Math.round((total / n) * 100) / 100 : total * (s.multiplier ?? 1));

    it(`${q.id}: minimum and maximum match the declared range`, () => {
      const lowest = scoreQuestionnaire(q, answersFor(q, n * Math.min(...vals)));
      const highest = scoreQuestionnaire(q, answersFor(q, n * Math.max(...vals)));
      expect(lowest.score).toBe(s.min ?? 0);
      expect(highest.score).toBe(s.max);
      expect(lowest.min).toBe(s.min ?? 0);
      expect(highest.band).toBe(s.bands.at(-1));
      expect(lowest.riskFlag).toBe(false);
    });

    it(`${q.id}: band edges`, () => {
      for (const [total, level] of EDGES[q.id]) {
        const r = scoreQuestionnaire(q, answersFor(q, total));
        expect(r.score).toBe(toScore(total));
        expect(r.band.level, `${q.id} at ${total}`).toBe(level);
      }
    });

    it(`${q.id}: each reverse-keyed item lowers the total when endorsed`, () => {
      const base = q.items.map((_, i) => (i === s.gate ? 1 : Math.min(...vals)));
      const baseScore = scoreQuestionnaire(q, base).score;
      q.items.forEach((_, i) => {
        if (i === s.gate) return;
        const bumped = base.map((v, k) => (k === i ? Math.max(...vals) : v));
        const diff = scoreQuestionnaire(q, bumped).score - baseScore;
        expect(Math.sign(diff), `${q.id} item ${i + 1}`).toBe(s.reverse?.includes(i) ? -1 : 1);
      });
    });
  }

  it("reverse keys are the published items", () => {
    const oneBased = (id) => byId(id).scoring.reverse.map((i) => i + 1);
    expect(oneBased("self-esteem")).toEqual([2, 5, 6, 8, 9]);
    expect(oneBased("pss10")).toEqual([4, 5, 7, 8]);
    expect(oneBased("resilience")).toEqual([2, 4, 6]);
    expect(oneBased("grit")).toEqual([1, 3, 5, 6]);
    const nfc = byId("need-for-cognition");
    expect(nfc.scoring.reverse.map((i) => nfc.items[i])).toEqual(["Have difficulty understanding abstract ideas.", "Try to avoid complex people.", "Avoid difficult reading material.", "Avoid philosophical discussions."]);
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

describe("threshold screeners: item rules and cut-offs on both sides", () => {
  const count = (id, answers) => scoreQuestionnaire(byId(id), answers);

  it("ASRS counts items 1-3 from Sometimes and items 4-6 from Often", () => {
    for (let i = 0; i < 6; i++) {
      const at = (v) => count("asrs", [0, 0, 0, 0, 0, 0].map((x, k) => (k === i ? v : x))).score;
      expect(at(1)).toBe(0);
      expect(at(2)).toBe(i < 3 ? 1 : 0);
      expect(at(3)).toBe(1);
      expect(at(4)).toBe(1);
    }
    expect(count("asrs", [2, 2, 2, 2, 2, 2])).toMatchObject({ score: 3, positive: false, max: 6, cutoff: 4 });
    expect(count("asrs", [2, 2, 2, 3, 2, 2])).toMatchObject({ score: 4, positive: true });
  });

  it("AQ-10 keys each item as published and cuts at 6", () => {
    const agreeKeyed = [1, 7, 8, 10];
    for (let item = 1; item <= 10; item++) {
      // Everything else answered so that it does not score.
      const quiet = (k) => (agreeKeyed.includes(k) ? 3 : 0);
      const at = (v) => count("aq10", Array.from({ length: 10 }, (_, k) => (k + 1 === item ? v : quiet(k + 1)))).score;
      expect([at(0), at(1), at(2), at(3)]).toEqual(agreeKeyed.includes(item) ? [1, 1, 0, 0] : [0, 0, 1, 1]);
    }
    expect(count("aq10", [3, 0, 0, 0, 0, 0, 3, 3, 0, 3])).toMatchObject({ score: 0, positive: false });
    expect(count("aq10", [3, 3, 3, 3, 3, 3, 3, 3, 0, 3])).toMatchObject({ score: 5, positive: false }); // items 2-6
    expect(count("aq10", [3, 3, 3, 3, 3, 3, 3, 3, 3, 3])).toMatchObject({ score: 6, positive: true }); // plus item 9
  });

  it("SAPAS and MSI-BPD range from 0 to their item count", () => {
    expect(count("sapas", [0, 0, 1, 0, 0, 0, 0, 0]).score).toBe(0);
    expect(count("sapas", [1, 1, 0, 1, 1, 1, 1, 1]).score).toBe(8);
    expect(count("sapas", [1, 0, 0, 0, 0, 0, 0, 0])).toMatchObject({ score: 2, positive: false });
    expect(count("msi-bpd", Array(10).fill(0))).toMatchObject({ score: 0, riskFlag: false });
    expect(count("msi-bpd", Array(10).fill(1))).toMatchObject({ score: 10, positive: true, riskFlag: true });
  });

  it("only instruments with a self-harm item can raise the risk flag", () => {
    expect(questionnaires.filter((q) => q.riskItem !== undefined).map((q) => q.id).sort()).toEqual(["msi-bpd", "phq9"]);
    expect(byId("phq9").items[byId("phq9").riskItem]).toMatch(/better off dead/);
    expect(byId("msi-bpd").items[byId("msi-bpd").riskItem]).toMatch(/suicide attempt/);
    for (const v of [1, 2, 3]) expect(count("phq9", [0, 0, 0, 0, 0, 0, 0, 0, v]).riskFlag).toBe(true);
  });
});

describe("PC-PTSD-5 entry question", () => {
  const q = byId("pc-ptsd-5");
  it("scores 0 when no event is reported, whatever follows", () => {
    expect(scoreQuestionnaire(q, [0, 1, 1, 1, 1, 1])).toMatchObject({ score: 0, max: 5, band: { level: "Below the screening cut-point" } });
  });
  it("does not count the entry question itself", () => {
    expect(scoreQuestionnaire(q, [1, 0, 0, 0, 0, 0]).score).toBe(0);
    expect(scoreQuestionnaire(q, [1, 1, 1, 1, 1, 1]).score).toBe(5);
  });
  it("is marked sensitive and never calls a result a diagnosis", () => {
    expect(q.sensitive).toBe(true);
    for (const b of q.scoring.bands) expect(b.text.replace("not a diagnosis", "")).not.toMatch(/diagnos/i);
  });
});

describe("ECR-R subscales", () => {
  const q = byId("ecr-r");
  const [anx, avo] = q.scoring.scales;
  // Answers that give one scale a keyed total, with the other scale left neutral.
  const forScale = (sc, total) => {
    let need = total - sc.items.length;
    const a = q.items.map(() => 4);
    for (const i of sc.items) {
      const add = Math.min(6, need);
      need -= add;
      a[i] = sc.reverse.includes(i) ? 7 - add : 1 + add;
    }
    return a;
  };
  const trait = (answers, key) => scoreQuestionnaire(q, answers).traits.find((t) => t.key === key);

  it("uses the author's keys: 18 items per scale, 2 and 12 reverse-keyed", () => {
    expect(anx.items).toHaveLength(18);
    expect(avo.items).toHaveLength(18);
    expect(new Set([...anx.items, ...avo.items]).size).toBe(36);
    expect(anx.reverse.map((i) => q.items[i])).toEqual(["I rarely worry about my partner leaving me.", "I do not often worry about being abandoned."]);
    expect(avo.reverse).toHaveLength(12);
    expect(q.items[avo.items[0]]).toBe("I prefer not to show a partner how I feel deep down.");
    expect(avo.reverse).not.toContain(avo.items[0]);
  });

  it("returns the traits shape with min, max and band edges on both sides", () => {
    for (const sc of [anx, avo]) {
      expect(trait(forScale(sc, 18), sc.key)).toMatchObject({ score: 1, min: 1, max: 7, band: "low", level: "Low", tone: "good" });
      expect(trait(forScale(sc, 126), sc.key)).toMatchObject({ score: 7, band: "high", level: "High", tone: "warn" });
      expect(trait(forScale(sc, 53), sc.key)).toMatchObject({ score: 2.94, band: "low" });
      expect(trait(forScale(sc, 54), sc.key)).toMatchObject({ score: 3, band: "mid" });
      expect(trait(forScale(sc, 90), sc.key)).toMatchObject({ score: 5, band: "mid" });
      expect(trait(forScale(sc, 91), sc.key)).toMatchObject({ score: 5.06, band: "high" });
    }
    const r = scoreQuestionnaire(q, q.items.map(() => 4));
    expect(r).toMatchObject({ type: "traits", riskFlag: false });
    expect(r.traits.every((t) => t.score === 4 && typeof t.note === "string")).toBe(true);
  });

  it("agreeing with everything does not max out a scale with reverse items", () => {
    expect(trait(q.items.map(() => 7), "avoidance").score).toBe(3); // 6 keyed at 7, 12 reversed to 1
  });
});

describe("summaries sent to the AI", () => {
  it("carry computed numbers and labels only", () => {
    const big = summarize(scoreQuestionnaire(byId("big-five"), fill(byId("big-five"), 3)));
    expect(big.traits.Extraversion).toBe("30/50 (Middle)");
    const ecr = summarize(scoreQuestionnaire(byId("ecr-r"), fill(byId("ecr-r"), 4)));
    expect(ecr.traits["Attachment anxiety"]).toBe("4/7 (Moderate)");
    expect(summarize({ type: "traits", traits: [{ name: "Extraversion", score: 30, band: "mid" }], riskFlag: false }).traits.Extraversion).toBe("30/50 (mid)"); // saved before level existed
    expect(summarize({ type: "traits", traits: [{ name: "X", score: 30, max: 50, level: "Middle", percentile: 62 }], normNote: "n", riskFlag: false })).toMatchObject({ traits: { X: "30/50 (Middle, percentile 62)" }, normNote: "n" });
    expect(summarize(scoreQuestionnaire(byId("phq9"), fill(byId("phq9"), 1)))).toEqual({ score: 9, min: 0, max: 27, band: "Mild", riskFlag: true });
    const task = { type: "sum", score: 251, unit: "ms", lowerIsBetter: true, metrics: { rounds: 8 }, band: { level: "Typical" } };
    expect(summarize(task)).toMatchObject({ score: 251, unit: "ms", lowerIsBetter: true, metrics: { rounds: 8 }, band: "Typical" });
    expect(JSON.stringify(summarize({ type: "sum", score: 1, max: 2, band: { level: "x" }, answers: [1, 2] }))).not.toMatch(/answers/);
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
