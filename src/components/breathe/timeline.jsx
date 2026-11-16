// Breathing patterns and the one function that turns elapsed time into a phase.
// A phase is [label, seconds, orb scale at the end of the phase].

export const LOW = 0.64;

export const PATTERNS = [
  { id: "calm", pill: "Calm 4-6", name: "Calming breath", desc: "Longer exhales than inhales nudge the body toward rest. Good for winding down.", phases: [["Breathe in", 4, 1], ["Breathe out slowly", 6, LOW]] },
  { id: "box", pill: "Box 4-4-4-4", name: "Box breathing", desc: "Four equal sides. Steady and easy to remember under pressure.", phases: [["Breathe in", 4, 1], ["Hold", 4, 1], ["Breathe out", 4, LOW], ["Hold", 4, LOW]] },
  { id: "478", pill: "4-7-8", name: "4-7-8 breathing", desc: "A long hold and a long exhale. Many people use it before sleep.", phases: [["Breathe in", 4, 1], ["Hold", 7, 1], ["Breathe out", 8, LOW]] },
  { id: "coherent", pill: "Coherent 5.5-5.5", name: "Coherent breathing", desc: "In and out at the same slow pace, about five and a half breaths a minute.", phases: [["Breathe in", 5.5, 1], ["Breathe out", 5.5, LOW]] },
];

export const cycleMs = (pattern) => pattern.phases.reduce((sum, p) => sum + p[1], 0) * 1000;

// Everything on screen is derived from elapsed milliseconds alone, so phases cannot drift
// however long the session runs or however uneven the frame rate is.
export function phaseAt(pattern, ms) {
  const { phases } = pattern;
  const cycle = cycleMs(pattern);
  const breaths = Math.floor(ms / cycle);
  let t = ms - breaths * cycle;
  let index = 0;
  while (index < phases.length - 1 && t >= phases[index][1] * 1000) {
    t -= phases[index][1] * 1000;
    index += 1;
  }
  const [label, secs, to] = phases[index];
  const from = phases[(index + phases.length - 1) % phases.length][2];
  const eased = 0.5 - Math.cos(Math.PI * Math.min(1, t / (secs * 1000))) / 2;
  return { index, label, secs, left: Math.ceil(secs - t / 1000), breaths, scale: from + (to - from) * eased };
}
