// Matrix reasoning: procedurally generated Raven-style 3x3 puzzles + Rasch (1PL) scoring.
// Every item is built from a fixed blueprint (which attributes follow which rule), so a new
// seed gives a fresh parallel form of identical structure. Item difficulties are design
// estimates from rule complexity, NOT calibrated on a norm sample — see METHOD below.

export const SHAPES = ["circle", "square", "triangle", "diamond", "star", "cross"];
export const FILLS = ["empty", "striped", "solid"];
export const SIZES = [0.55, 0.78, 1]; // relative scale
export const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

// Rules: "row" = constant within a row, differs between rows; "prog" = steps by one per column;
// "dist" = each row holds all three values (Latin square); "dist-" = Latin square shifted the other way;
// "add" = count in column 3 is the sum of columns 1 and 2.
export const BLUEPRINTS = [
  { b: -2.8, rules: { count: "prog" } },
  { b: -2.6, rules: { size: "prog" } },
  { b: -2.3, rules: { shape: "dist" } },
  { b: -2.0, rules: { fill: "dist" } },
  { b: -1.8, rules: { count: "prog", shape: "row" } },
  { b: -1.5, rules: { angle: "prog" } },
  { b: -1.3, rules: { shape: "dist", fill: "row" } },
  { b: -1.0, rules: { count: "prog", size: "prog" } },
  { b: -0.8, rules: { shape: "dist", count: "dist" } },
  { b: -0.5, rules: { angle: "prog", fill: "dist" } },
  { b: -0.3, rules: { count: "add" } },
  { b: 0.0, rules: { shape: "dist", size: "dist-" } },
  { b: 0.2, rules: { fill: "prog", count: "dist", shape: "row" } },
  { b: 0.5, rules: { angle: "dist", size: "prog" } },
  { b: 0.7, rules: { count: "add", shape: "dist" } },
  { b: 1.0, rules: { shape: "dist", fill: "dist-", size: "prog" } },
  { b: 1.2, rules: { angle: "prog", count: "dist-", fill: "row" } },
  { b: 1.5, rules: { count: "add", fill: "dist-", size: "row" } },
  { b: 1.7, rules: { shape: "dist", count: "dist-", fill: "dist" } },
  { b: 2.0, rules: { angle: "dist-", size: "dist", fill: "prog" } },
  { b: 2.3, rules: { count: "add", shape: "dist-", fill: "dist", size: "row" } },
  { b: 2.5, rules: { shape: "dist", count: "dist-", size: "dist", fill: "dist-" } },
  { b: 2.8, rules: { angle: "dist", count: "add", fill: "dist-", size: "dist" } },
  { b: 3.1, rules: { count: "add", shape: "dist-", size: "dist", fill: "dist-" } },
];

export const TIME_LIMIT_SEC = 20 * 60;

// mulberry32: small deterministic PRNG so a seed always reproduces the same form.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
function sample(r, arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n) out.push(copy.splice(Math.floor(r() * copy.length), 1)[0]);
  return out;
}
const shuffle = (r, arr) => sample(r, arr, arr.length);

const DOMAIN = {
  shape: SHAPES,
  fill: FILLS,
  size: [0, 1, 2],
  count: [1, 2, 3, 4],
  angle: ANGLES,
};

// Returns grid[row][col] = value for one attribute.
function attributeGrid(r, attr, rule) {
  const dom = DOMAIN[attr];
  if (!rule) {
    const v = attr === "count" ? 1 : attr === "size" ? 1 : pick(r, dom);
    return [0, 1, 2].map(() => [v, v, v]);
  }
  if (rule === "row") {
    const vals = sample(r, dom, 3);
    return vals.map((v) => [v, v, v]);
  }
  if (rule === "dist" || rule === "dist-") {
    const vals = sample(r, attr === "count" ? [1, 2, 3, 4] : dom, 3);
    const dir = rule === "dist" ? 1 : 2; // shift left vs right per row
    return [0, 1, 2].map((row) => [0, 1, 2].map((col) => vals[(col + row * dir) % 3]));
  }
  if (rule === "prog") {
    if (attr === "angle") {
      const step = pick(r, [1, 2]); // 45° or 90°
      return [0, 1, 2].map(() => {
        const start = Math.floor(r() * 8);
        return [0, 1, 2].map((c) => ANGLES[(start + c * step) % 8]);
      });
    }
    // count/size/fill progress through an ordered scale; start offset only where room allows
    const max = dom.length - 3;
    return [0, 1, 2].map(() => {
      const start = Math.floor(r() * (max + 1));
      return [0, 1, 2].map((c) => dom[start + c]);
    });
  }
  if (rule === "add") {
    const pairs = shuffle(r, [[1, 1], [1, 2], [2, 1], [1, 3], [3, 1], [2, 2]]).slice(0, 3);
    return pairs.map(([a, b]) => [a, b, a + b]);
  }
  throw new Error(`Unknown rule ${rule}`);
}

export const cellKey = (c) => `${c.shape}|${c.fill}|${c.size}|${c.count}|${c.angle}`;

export function generateItem(blueprint, seed) {
  const r = rng(seed);
  const rules = { ...blueprint.rules };
  const usesAngle = Boolean(rules.angle);
  const grids = {};
  for (const attr of Object.keys(DOMAIN)) {
    if (attr === "angle" && !usesAngle) {
      grids.angle = [0, 1, 2].map(() => [0, 0, 0]);
      continue;
    }
    if (attr === "shape" && usesAngle) {
      grids.shape = [0, 1, 2].map(() => ["arrow", "arrow", "arrow"]); // rotation needs an asymmetric shape
      continue;
    }
    grids[attr] = attributeGrid(r, attr, rules[attr]);
  }
  const cells = [0, 1, 2].map((row) =>
    [0, 1, 2].map((col) => ({
      shape: grids.shape[row][col],
      fill: grids.fill[row][col],
      size: grids.size[row][col],
      count: grids.count[row][col],
      angle: grids.angle[row][col],
    }))
  );
  const answer = cells[2][2];

  // Balanced answer set (as in I-RAVEN): pick 3 attributes, give each one wrong alternative,
  // and take all 2^3 combinations. Every attribute value then appears in exactly half the
  // options, so the answer can't be spotted as "the option most others resemble".
  const ruleAttrs = shuffle(r, Object.keys(rules));
  const otherAttrs = shuffle(
    r,
    Object.keys(DOMAIN).filter((a) => !rules[a] && !(a === "angle" && !usesAngle) && !(a === "shape" && usesAngle))
  );
  const varied = [...ruleAttrs, ...otherAttrs].slice(0, 3);
  const alt = Object.fromEntries(varied.map((a) => [a, pick(r, DOMAIN[a].filter((v) => v !== answer[a]))]));
  const options = Array.from({ length: 8 }, (_, mask) => {
    const opt = { ...answer };
    varied.forEach((a, bit) => {
      if (mask & (1 << bit)) opt[a] = alt[a];
    });
    return opt;
  });
  const order = shuffle(r, options.map((_, i) => i));
  const shuffled = order.map((i) => options[i]);
  return {
    b: blueprint.b,
    rules,
    cells,
    options: shuffled,
    correctIndex: order.indexOf(0),
  };
}

export function generateForm(seed) {
  return BLUEPRINTS.map((bp, i) => generateItem(bp, (seed * 7919 + i * 104729) >>> 0));
}

// ---------------- Rasch scoring (EAP with a standard-normal prior) ----------------

const GRID = Array.from({ length: 161 }, (_, i) => -4 + i * 0.05);
const logistic = (x) => 1 / (1 + Math.exp(-x));

// responses: array of { b, correct: boolean } for items reached. Unanswered items count as wrong.
export function estimateAbility(responses) {
  const post = GRID.map((t) => {
    let ll = -0.5 * t * t;
    for (const { b, correct } of responses) {
      const p = logistic(t - b);
      ll += Math.log(correct ? p : 1 - p);
    }
    return ll;
  });
  const max = Math.max(...post);
  const w = post.map((l) => Math.exp(l - max));
  const sum = w.reduce((a, x) => a + x, 0);
  const theta = GRID.reduce((a, t, i) => a + t * w[i], 0) / sum;
  const variance = GRID.reduce((a, t, i) => a + (t - theta) ** 2 * w[i], 0) / sum;
  return { theta, se: Math.sqrt(variance) };
}

export function scoreMatrix(form, answers) {
  const responses = form.map((item, i) => ({ b: item.b, correct: answers[i] === item.correctIndex }));
  const correct = responses.filter((x) => x.correct).length;
  const { theta, se } = estimateAbility(responses);
  const estimate = Math.round(100 + 15 * theta);
  const half = Math.round(1.645 * 15 * se); // 90% interval
  return {
    type: "matrix",
    correct,
    total: form.length,
    estimate,
    low: estimate - half,
    high: estimate + half,
    percentile: Math.round(100 * normalCdf(theta)),
  };
}

export function normalCdf(z) {
  // Abramowitz–Stegun 7.1.26 approximation, error < 1.5e-7
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(z * z) / 2);
  return z >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
}
