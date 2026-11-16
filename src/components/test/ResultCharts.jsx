import { useId } from "react";
import { motion } from "framer-motion";
import { EASE } from "../ui";

export function BellCurve({ low, high, estimate }) {
  const id = useId().replace(/:/g, "");
  // x maps IQ-scale 55..145 onto 0..300
  const x = (v) => ((Math.min(145, Math.max(55, v)) - 55) / 90) * 300;
  const pts = Array.from({ length: 61 }, (_, i) => {
    const v = 55 + i * 1.5;
    const z = (v - 100) / 15;
    return [x(v), 110 - 95 * Math.exp(-(z * z) / 2)];
  });
  const path = "M" + pts.map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`).join("L");
  return (
    <svg viewBox="0 0 300 140" className="w-full max-w-md" role="img" aria-label={`Estimate ${estimate}, likely range ${low} to ${high}, on a scale where 100 is average`}>
      <defs>
        <clipPath id={id}><rect x={x(low)} y="0" width={x(high) - x(low)} height="112" /></clipPath>
      </defs>
      <path d={`${path}L300 110L0 110z`} fill="var(--sunken)" />
      <motion.path d={`${path}L300 110L0 110z`} fill="var(--brand)" fillOpacity="0.28" clipPath={`url(#${id})`} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }} />
      <motion.path d={path} fill="none" stroke="var(--ink-3)" strokeWidth="1.5" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: EASE }} />
      <line x1={x(estimate)} x2={x(estimate)} y1="8" y2="110" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="0" x2="300" y1="110" y2="110" stroke="var(--line)" />
      {[70, 85, 100, 115, 130].map((v) => (
        <text key={v} x={x(v)} y="128" textAnchor="middle" fontSize="11" fill="var(--ink-3)">{v}</text>
      ))}
    </svg>
  );
}

// Where a percentile sits between 0 and 100. The number itself is always shown as text beside it.
export function PercentileBar({ value }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="pb-6 pt-2" role="img" aria-label={`Percentile ${value} of 100`}>
      <div className="relative h-2.5 rounded-full bg-sunken">
        {[25, 50, 75].map((t) => (
          <span key={t} className="absolute inset-y-0 w-px bg-line" style={{ left: `${t}%` }} />
        ))}
        <motion.span className="absolute top-1/2 -ml-2.5 -mt-2.5 h-5 w-5 rounded-full border-[3px] border-surface bg-brand shadow-[0_0_0_1px_var(--line)]" style={{ left: `${pct}%` }} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 420, damping: 26, delay: 0.2 }} />
        {[0, 50, 100].map((t) => (
          <span key={t} className="num absolute top-5 -translate-x-1/2 text-xs text-ink-3" style={{ left: `${t}%` }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// A profile of several scores, each on its own scale. Drawn in the colour of its container (white on the sky).
export function Radar({ traits }) {
  const n = traits.length;
  const at = (i, r) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [170 + r * Math.cos(a), 135 + r * Math.sin(a)];
  };
  const ring = (r) => traits.map((_, i) => at(i, r).map((v) => v.toFixed(1)).join(",")).join(" ");
  const shape = traits.map((t, i) => at(i, 14 + 66 * Math.min(1, Math.max(0, (t.score - t.min) / (t.max - t.min || 1)))));
  return (
    <svg viewBox="0 0 340 270" className="w-full max-w-[340px] overflow-visible" aria-hidden="true" fill="none" stroke="currentColor">
      {[80, 53, 26].map((r) => <polygon key={r} points={ring(r)} strokeOpacity="0.28" />)}
      {traits.map((_, i) => <line key={i} x1="170" y1="135" x2={at(i, 80)[0]} y2={at(i, 80)[1]} strokeOpacity="0.2" />)}
      <motion.polygon points={shape.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")} fill="currentColor" fillOpacity="0.22" strokeWidth="2.5" strokeLinejoin="round" style={{ transformOrigin: "170px 135px" }} initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.1, ease: EASE, delay: 0.25 }} />
      {traits.map((t, i) => {
        const [x, y] = at(i, 96);
        return (
          <text key={t.key} x={x} y={y + 4} textAnchor={Math.abs(x - 170) < 8 ? "middle" : x > 170 ? "start" : "end"} fontSize="11.5" fontWeight="500" fill="currentColor" stroke="none">
            {t.name.split(" / ").pop()}
          </text>
        );
      })}
    </svg>
  );
}
