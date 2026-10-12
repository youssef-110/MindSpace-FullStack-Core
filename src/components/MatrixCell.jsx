import { useId } from "react";
import { motion } from "framer-motion";
import { SIZES } from "../lib/tests/matrix";

const LAYOUT = {
  1: [[50, 50]],
  2: [[30, 50], [70, 50]],
  3: [[50, 28], [28, 70], [72, 70]],
  4: [[30, 30], [70, 30], [30, 70], [70, 70]],
};
const BASE_R = { 1: 30, 2: 18, 3: 17, 4: 16 };

function shapePath(shape, r) {
  switch (shape) {
    case "square":
      return `M${-r * 0.82} ${-r * 0.82}h${r * 1.64}v${r * 1.64}h${-r * 1.64}z`;
    case "triangle":
      return `M0 ${-r}L${r * 0.95} ${r * 0.72}H${-r * 0.95}z`;
    case "diamond":
      return `M0 ${-r}L${r * 0.62} 0L0 ${r}L${-r * 0.62} 0z`;
    case "cross": {
      const a = r * 0.34;
      return `M${-a} ${-r}h${2 * a}v${r - a}h${r - a}v${2 * a}h${-(r - a)}v${r - a}h${-2 * a}v${-(r - a)}h${-(r - a)}v${-2 * a}h${r - a}z`;
    }
    case "star": {
      let d = "";
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 ? r * 0.45 : r;
        const ang = (Math.PI / 5) * i - Math.PI / 2;
        d += `${i ? "L" : "M"}${(rad * Math.cos(ang)).toFixed(2)} ${(rad * Math.sin(ang)).toFixed(2)}`;
      }
      return d + "z";
    }
    case "arrow":
      return `M0 ${-r}L${r * 0.78} ${-r * 0.05}H${r * 0.3}V${r}H${-r * 0.3}V${-r * 0.05}H${-r * 0.78}z`;
    default:
      return null; // circle
  }
}

// Renders one matrix cell. `cell` = { shape, fill, size, count, angle } or null for the blank.
export default function MatrixCell({ cell, label }) {
  const id = useId().replace(/:/g, "");
  if (!cell) {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label={label ?? "Missing piece"}>
        <text x="50" y="62" textAnchor="middle" fontSize="34" fontWeight="700" fill="var(--marigold)">?</text>
      </svg>
    );
  }
  const r = BASE_R[cell.count] * SIZES[cell.size];
  const fill = cell.fill === "solid" ? "currentColor" : cell.fill === "striped" ? `url(#h${id})` : "none";
  const d = shapePath(cell.shape, r);
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label={label ?? `${cell.count} ${cell.fill} ${cell.shape}`}>
      <defs>
        <pattern id={`h${id}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="2.4" />
        </pattern>
      </defs>
      {LAYOUT[cell.count].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${cell.angle})`} fill={fill} stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
          {d ? <path d={d} /> : <circle r={r} />}
        </g>
      ))}
    </svg>
  );
}

export function MatrixGrid({ cells, reveal }) {
  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-[var(--r-md)] bg-sunken" aria-label="Pattern grid, bottom-right piece missing">
      {cells.flat().map((c, i) => (
        <motion.div
          key={i}
          variants={{ hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1 } }}
          className={`aspect-square rounded-[var(--r-sm)] p-1.5 ${i === 8 && !reveal ? "border-2 border-dashed border-marigold bg-surface" : "bg-surface"}`}
        >
          <MatrixCell cell={i === 8 && !reveal ? null : c} />
        </motion.div>
      ))}
    </div>
  );
}
