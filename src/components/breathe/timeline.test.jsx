import { describe, it, expect } from "vitest";
import { PATTERNS, LOW, cycleMs, phaseAt } from "./timeline";

const box = PATTERNS.find((p) => p.id === "box");
const coherent = PATTERNS.find((p) => p.id === "coherent");

describe("breathing timeline", () => {
  it("walks the phases of a cycle in order", () => {
    expect(phaseAt(box, 0)).toMatchObject({ index: 0, label: "Breathe in", left: 4, breaths: 0, scale: LOW });
    expect(phaseAt(box, 3999)).toMatchObject({ index: 0, left: 1 });
    expect(phaseAt(box, 4000)).toMatchObject({ index: 1, label: "Hold", left: 4, scale: 1 });
    expect(phaseAt(box, 8000)).toMatchObject({ index: 2, label: "Breathe out" });
    expect(phaseAt(box, 15999)).toMatchObject({ index: 3, left: 1, breaths: 0 });
  });

  it("does not drift after five minutes", () => {
    // 300 s of box breathing is 18 full cycles plus 12 s: the start of the last hold.
    expect(phaseAt(box, 300_000)).toMatchObject({ index: 3, left: 4, breaths: 18 });
    // Coherent: 27 cycles of 11 s, then 3 s into the inhale.
    expect(cycleMs(coherent)).toBe(11_000);
    expect(phaseAt(coherent, 300_000)).toMatchObject({ index: 0, left: 3, breaths: 27 });
  });

  it("keeps the orb scale inside its range for every pattern", () => {
    for (const p of PATTERNS) {
      for (let ms = 0; ms < cycleMs(p) * 2; ms += 250) {
        const { scale } = phaseAt(p, ms);
        expect(scale).toBeGreaterThanOrEqual(LOW - 1e-9);
        expect(scale).toBeLessThanOrEqual(1 + 1e-9);
      }
    }
  });
});
