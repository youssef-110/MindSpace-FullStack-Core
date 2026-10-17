import { Link } from "react-router-dom";
import { crisisResources } from "../lib/safety";

export function LogoMark({ size = 32 }) {
  // Direction A, "the missing piece": a 3×3 matrix whose last cell is the answer you find.
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="var(--ink)" />
      <g fill="var(--paper)">
        {[0, 1, 2].flatMap((r) =>
          [0, 1, 2].map((c) =>
            r === 2 && c === 2 ? null : <rect key={`${r}${c}`} x={12 + c * 14.5} y={12 + r * 14.5} width="11" height="11" rx="3" />
          )
        )}
      </g>
      <circle cx="46.5" cy="46.5" r="6.2" fill="var(--marigold)" />
    </svg>
  );
}

const ICONS = {
  home: "M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z",
  learn: "M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5zM12 6v13.5",
  tests: "M4 4h4.5v4.5H4zM9.75 4h4.5v4.5h-4.5zM15.5 4H20v4.5h-4.5zM4 9.75h4.5v4.5H4zM9.75 9.75h4.5v4.5h-4.5zM15.5 9.75H20v4.5h-4.5zM4 15.5h4.5V20H4zM9.75 15.5h4.5V20h-4.5z",
  results: "M5 20V11M10 20V5M15 20v-6M20 20V9",
  ask: "M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-7l-4.5 3.5V16H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  sun: "M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z",
  moon: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z",
  back: "M15 5l-7 7 7 7",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5",
};

export function Icon({ name, size = 22, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={ICONS[name]} />
    </svg>
  );
}

export function CrisisCallout({ compact = false }) {
  return (
    <section role="alert" className="rounded-[var(--r-lg)] border-2 border-rose/40 bg-surface p-5 sm:p-6">
      <h2 className="text-xl font-bold mb-2">Before your score: are you safe right now?</h2>
      <p className="text-ink-2 mb-4 max-w-prose">
        One of your answers mentioned hurting yourself or not wanting to be alive. You don't have to handle that alone, and talking
        to someone today can really help.
      </p>
      <ul className={`grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
        {crisisResources.map((r) => (
          <li key={r.name} className="rounded-[var(--r-md)] bg-sunken p-3.5">
            <div className="font-bold">{r.contact}</div>
            <div className="text-sm text-ink-2">{r.name}</div>
          </li>
        ))}
      </ul>
      <Link to="/help" className="link inline-block mt-4">More ways to get support</Link>
    </section>
  );
}

export function Meter({ value, min = 0, max, cutoff, label }) {
  const pct = ((value - min) / (max - min)) * 100;
  const cut = cutoff !== undefined ? ((cutoff - min) / (max - min)) * 100 : null;
  return (
    <div className="relative h-3 rounded-full bg-sunken" role="img" aria-label={label ?? `${value} out of ${max}`}>
      <div className="absolute inset-y-0 left-0 rounded-full bg-brand transition-[width] duration-700" style={{ width: `${Math.max(2, pct)}%` }} />
      {cut !== null && <div className="absolute -top-1 -bottom-1 w-0.5 bg-ink" style={{ left: `${cut}%` }} title={`Threshold ${cutoff}`} />}
    </div>
  );
}
