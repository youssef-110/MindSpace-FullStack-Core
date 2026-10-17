import { useId } from "react";
import { Link } from "react-router-dom";
import { crisisResources } from "../lib/safety";

// Rubin's vase: two facing profiles, and the space between the minds forms a vase.
const VASE = "M49 4C48.93 5 49 8 48.6 10C48.2 12 47.47 14.23 46.6 16C45.73 17.77 43.73 19.37 43.4 20.6C43.07 21.83 44.47 22.5 44.6 23.4C44.73 24.3 45.33 24.63 44.2 26C43.07 27.37 38.4 30.27 37.8 31.6C37.2 32.93 40 33.37 40.6 34C41.2 34.63 41.57 34.83 41.4 35.4C41.23 35.97 39.57 36.73 39.6 37.4C39.63 38.07 41.53 38.73 41.6 39.4C41.67 40.07 39.83 40.63 40 41.4C40.17 42.17 42.37 42.97 42.6 44C42.83 45.03 41.97 46.53 41.4 47.6C40.83 48.67 38.5 49.33 39.2 50.4C39.9 51.47 43.87 52.4 45.6 54C47.33 55.6 48.93 59 49.6 60L14.4 60C15.07 59 16.67 55.6 18.4 54C20.13 52.4 24.1 51.47 24.8 50.4C25.5 49.33 23.17 48.67 22.6 47.6C22.03 46.53 21.17 45.03 21.4 44C21.63 42.97 23.83 42.17 24 41.4C24.17 40.63 22.33 40.07 22.4 39.4C22.47 38.73 24.37 38.07 24.4 37.4C24.43 36.73 22.77 35.97 22.6 35.4C22.43 34.83 22.8 34.63 23.4 34C24 33.37 26.8 32.93 26.2 31.6C25.6 30.27 20.93 27.37 19.8 26C18.67 24.63 19.27 24.3 19.4 23.4C19.53 22.5 20.93 21.83 20.6 20.6C20.27 19.37 18.27 17.77 17.4 16C16.53 14.23 15.8 12 15.4 10C15 8 15.07 5 15 4Z";

export function LogoMark({ size = 32 }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      <clipPath id={`m${id}`}>
        <circle cx="32" cy="32" r="30" />
      </clipPath>
      <g clipPath={`url(#m${id})`}>
        <rect width="64" height="64" fill="var(--ink)" />
        <path d={VASE} fill="var(--paper)" />
      </g>
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
      <h2 className="text-xl font-semibold mb-2">Before your score: are you safe right now?</h2>
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
