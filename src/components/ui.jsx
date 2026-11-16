import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { crisisResources } from "../lib/safety";

// Shared UI kit. Rules for using it are in DESIGN.md.

// eslint-disable-next-line react-refresh/only-export-components
export const EASE = [0.22, 1, 0.36, 1];

// ---------------- Brand ----------------

// Two hills at dusk that read as a lower-case "m", under one evening star.
export function LogoMark({ size = 32, className = "" }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={`shrink-0 ${className}`}>
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f78f5" />
          <stop offset="0.5" stopColor="#7b7ed8" />
          <stop offset="1" stopColor="#e8a087" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill={`url(#g${id})`} />
      <path d="M15 45V34.5a8.5 8.5 0 0 1 17 0V45M32 34.5a8.5 8.5 0 0 1 17 0V45" fill="none" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="45.5" cy="17.5" r="3.4" fill="#fff" />
    </svg>
  );
}

export function Wordmark({ size = 30, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[1.0625rem] font-semibold tracking-[-0.03em] text-ink ${className}`}>
      <LogoMark size={size} />
      MindSpace
    </span>
  );
}

// ---------------- Icons (24px, 1.8 stroke) ----------------

const ICONS = {
  home: "M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z",
  learn: "M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5zM12 6v13.5",
  tests: "M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM16.75 13.5v6.5M13.5 16.75H20",
  results: "M5 20V11M10 20V5M15 20v-6M20 20V9",
  ask: "M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-7l-4.5 3.5V16H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  sun: "M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z",
  moon: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z",
  back: "M15 5l-7 7 7 7",
  chevron: "M9 5l7 7-7 7",
  arrow: "M5 12h14M13 6l6 6-6 6",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5",
  check: "M5 12.5l4.5 4.5L19 7.5",
  close: "M6 6l12 12M18 6L6 18",
  plus: "M12 5v14M5 12h14",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2",
  spark: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
  wind: "M3 9h10a3 3 0 1 0-3-3M3 14h15a3 3 0 1 1-3 3M3 19h6",
  shield: "M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6z",
  lock: "M7 11V8a5 5 0 0 1 10 0v3M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z",
  chart: "M4 19h16M7 16v-4M12 16V8M17 16v-6",
  play: "M8 5.5v13l11-6.5z",
  calendar: "M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM4 10h16M8 3v4M16 3v4",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5.5M12 7.6v.2",
  alert: "M12 4l9 15.5H3zM12 10v4.5M12 17.3v.2",
  external: "M14 5h5v5M19 5l-8 8M11 6H6a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-5",
  download: "M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 20h14",
  trash: "M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13",
  print: "M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M7 14h10v6H7z",
  refresh: "M20 11a8 8 0 0 0-14.5-4M4 4v3.5h3.5M4 13a8 8 0 0 0 14.5 4M20 20v-3.5h-3.5",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12v.01",
  bolt: "M13 3L5 13.5h6L10 21l8-10.5h-6z",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  send: "M4 12l16-8-6 16-2.5-6.5z",
  smile: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 14c1 1.4 2.2 2 3.5 2s2.5-.6 3.5-2M9 9.5v.5M15 9.5v.5",
  pencil: "M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19zM14.5 6.5l3 3",
  flame: "M12 21c3.6 0 6-2.5 6-6 0-3-2-5-3-7.5-.5 1.5-1.5 2.5-2.5 3C12 8 11 5 9 3c.3 3-3 5.500-3 9.500 0 3.500 2.400 6 6 6z",
  people: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.500 20c.8-3.200 3.200-5 6.500-5s5.700 1.800 6.500 5M16 4.300a3.500 3.500 0 0 1 0 6.400M18.500 15.300c1.500.700 2.600 2.300 3 4.700",
};

export function Icon({ name, size = 22, className = "", strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`shrink-0 ${className}`}>
      <path d={ICONS[name]} />
    </svg>
  );
}

// ---------------- Motion ----------------

// Fades and lifts its children in once, when they scroll into view.
export function Reveal({ children, className = "", delay = 0, y = 18, as = "div" }) {
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay, ease: EASE }}>
      {children}
    </Tag>
  );
}

// Parent + child pair for staggered lists: <Stagger><StaggerItem/>…</Stagger>
export function Stagger({ children, className = "", gap = 0.07, delay = 0, as = "div", ...rest }) {
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }} {...rest}>
      {children}
    </Tag>
  );
}

export function StaggerItem({ children, className = "", as = "div", ...rest }) {
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag className={className} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }} {...rest}>
      {children}
    </Tag>
  );
}

// Counts up to `value` when it scrolls into view.
export function CountUp({ value, decimals = 0, duration = 1.1, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, { duration, ease: EASE, onUpdate: setShown });
    return () => controls.stop();
  }, [inView, value, duration, reduce]);
  return (
    <span ref={ref} className={`num ${className}`}>
      {(reduce ? value : shown).toFixed(decimals)}
    </span>
  );
}

// ---------------- The sky ----------------

const STARS = [
  [6, 12, 1.4], [14, 30, 1], [22, 8, 1.8], [31, 22, 1.1], [38, 10, 1.5], [47, 28, 1], [55, 6, 1.3], [63, 18, 1.9],
  [71, 9, 1.1], [79, 26, 1.4], [87, 13, 1], [94, 22, 1.6], [10, 44, 1], [27, 40, 1.2], [44, 44, 0.9], [60, 38, 1.1], [76, 42, 0.9], [90, 40, 1.2],
];

const HILLS = [
  ["var(--hill-far)", "M0 150C180 90 320 120 480 100C640 80 760 30 900 70C1040 110 1220 60 1440 110V221H0Z", 34],
  ["var(--hill-mid)", "M0 180C200 130 340 170 520 140C700 110 860 150 1020 120C1180 90 1320 140 1440 130V221H0Z", 18],
  ["var(--hill-near)", "M0 205C240 170 420 200 640 185C860 170 1080 205 1440 175V221H0Z", 0],
];

function Hill({ fill, d, shift, progress }) {
  const y = useTransform(progress, [0, 1], [0, shift]);
  return <motion.path d={d} fill={fill} style={{ y }} />;
}

// The dusk gradient with stars, a low sun and hills. Use at most one per page (see DESIGN.md).
// Text inside must be white: put `sky-text` on copy for legibility.
export function Sky({ children, className = "", hills = true, stars = true, sun = true, as = "section", ...rest }) {
  const Tag = as;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  return (
    <Tag ref={ref} className={`sky ${className}`} {...rest}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-[1]">
        {sun && <div className="absolute left-[68%] top-[62%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,236,205,0.85) 0%, rgba(255,214,170,0.35) 28%, rgba(255,214,170,0) 62%)" }} />}
        {stars &&
          STARS.map(([x, y, r], i) => (
            <span key={i} className="animate-twinkle absolute rounded-full bg-white" style={{ left: `${x}%`, top: `${y}%`, width: r * 2, height: r * 2, animationDelay: `${(i * 0.47) % 3.6}s` }} />
          ))}
        {hills && (
          <svg viewBox="0 0 1440 220" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[26%] min-h-[110px] w-full">
            {HILLS.map(([fill, d, shift]) => (
              <Hill key={d} fill={fill} d={d} shift={shift} progress={scrollYProgress} />
            ))}
          </svg>
        )}
      </div>
      {children}
    </Tag>
  );
}

// ---------------- Page furniture ----------------

export function PageHeader({ eyebrow, title, lead, children, className = "" }) {
  return (
    <motion.header className={`mb-10 max-w-3xl md:mb-14 ${className}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h1 className="text-[2.5rem] sm:text-5xl md:text-[3.5rem]">{title}</h1>
      {lead && <p className="lead mt-4 max-w-2xl">{lead}</p>}
      {children}
    </motion.header>
  );
}

export function BackLink({ to, children }) {
  return (
    <Link to={to} className="mb-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink-3 transition-colors hover:text-ink">
      <Icon name="back" size={18} />
      {children}
    </Link>
  );
}

// ---------------- Data display ----------------

// eslint-disable-next-line react-refresh/only-export-components
export const TONE = {
  good: { tag: "tag-good", text: "text-sage", color: "var(--sage)" },
  ok: { tag: "tag-brand", text: "text-brand-text", color: "var(--brand)" },
  warn: { tag: "tag-warn", text: "text-amber", color: "var(--amber)" },
  alert: { tag: "tag-alert", text: "text-rose", color: "var(--rose)" },
};

// A progress ring that draws itself in. `children` render in the centre.
export function Ring({ value, min = 0, max = 100, size = 132, stroke = 10, color = "var(--brand)", label, children, className = "" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min || 1)));
  return (
    <div className={`relative grid shrink-0 place-items-center ${className}`} style={{ width: size, height: size }} role="img" aria-label={label ?? `${value} out of ${max}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--sunken)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c * (1 - pct) }}
          viewport={{ once: true }}
          transition={{ duration: 1.3, ease: EASE, delay: 0.15 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function Meter({ value, min = 0, max, cutoff, label, color = "var(--brand)" }) {
  const pct = ((value - min) / (max - min)) * 100;
  const cut = cutoff !== undefined ? ((cutoff - min) / (max - min)) * 100 : null;
  return (
    <div className="relative h-2.5 rounded-full bg-sunken" role="img" aria-label={label ?? `${value} out of ${max}`}>
      <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: color }} initial={{ width: 0 }} whileInView={{ width: `${Math.min(100, Math.max(2, pct))}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE, delay: 0.1 }} />
      {cut !== null && <div className="absolute -bottom-1.5 -top-1.5 w-0.5 rounded-full bg-ink" style={{ left: `${cut}%` }} title={`Threshold ${cutoff}`} />}
    </div>
  );
}

// Tiny trend line. `points` are numbers, oldest first.
export function Sparkline({ points, min, max, width = 120, height = 36, color = "var(--brand)" }) {
  if (!points || points.length < 2) return null;
  const lo = min ?? Math.min(...points);
  const hi = max ?? Math.max(...points);
  const span = hi - lo || 1;
  const xy = points.map((p, i) => [(i / (points.length - 1)) * (width - 6) + 3, height - 3 - ((p - lo) / span) * (height - 6)]);
  const d = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
  const [lx, ly] = xy.at(-1);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="overflow-visible">
      <motion.path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE }} />
      <circle cx={lx} cy={ly} r="3" fill={color} />
    </svg>
  );
}

// ---------------- Safety ----------------

export function CrisisCallout({ compact = false }) {
  return (
    <section role="alert" className="rounded-[var(--r-lg)] border border-rose/30 bg-rose-soft p-5 sm:p-7">
      <h2 className="mb-2 text-[1.75rem]">Before your score: are you safe right now?</h2>
      <p className="mb-5 max-w-prose text-ink-2">
        One of your answers mentioned hurting yourself or not wanting to be alive. You don't have to handle that alone, and talking to
        someone today can really help.
      </p>
      <ul className={`grid gap-3 ${compact ? "" : "sm:grid-cols-2"}`}>
        {crisisResources.map((r) => (
          <li key={r.name} className="rounded-[var(--r-md)] bg-surface p-4">
            <div className="font-semibold text-ink">{r.contact}</div>
            <div className="text-sm text-ink-3">{r.name}</div>
          </li>
        ))}
      </ul>
      <Link to="/help" className="link mt-5 inline-block">More ways to get support</Link>
    </section>
  );
}
