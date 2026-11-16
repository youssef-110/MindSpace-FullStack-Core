import { motion } from "framer-motion";
import { EASE } from "../ui";
import { MOODS, WEEKDAYS, parseKey, shiftKey } from "../../lib/checkin";

// Mood visuals shared by the check-in page and Insights. Blue only: the sage / amber / rose
// tones are reserved for test results, and a mood is not a result.

const shortDate = (key) => parseKey(key).toLocaleDateString(undefined, { day: "numeric", month: "short" });

// A line-drawn face for mood 1 (Rough) to 5 (Great). Decorative: always pair it with the word.
export function MoodFace({ mood, size = 36, className = "" }) {
  const curve = (mood - 3) * 1.7; // positive smiles, negative frowns
  const y = 14.6 - curve * 0.45;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" className={`shrink-0 ${className}`}>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M9 9.4v.7M15 9.4v.7" strokeWidth="1.9" />
      <path d={`M8.4 ${y.toFixed(2)}Q12 ${(y + curve * 1.5).toFixed(2)} 15.6 ${y.toFixed(2)}`} />
    </svg>
  );
}

// Mood over the last `slots.length` days as a line that draws itself in. `slots` come from
// lastNDays(): oldest first, null for days without a check-in. Gaps break the line.
export function MoodChart({ slots, today }) {
  const W = 320;
  const H = 112;
  const n = slots.length;
  const x = (i) => 8 + (i / (n - 1 || 1)) * (W - 16);
  const y = (mood) => H - 10 - ((mood - 1) / 4) * (H - 20);
  const logged = slots.map((c, i) => c && [x(i), y(c.mood)]).filter(Boolean);
  const d = slots.map((c, i) => (c ? `${slots[i - 1] ? "L" : "M"}${x(i).toFixed(1)} ${y(c.mood).toFixed(1)}` : "")).join("");
  const moods = slots.filter(Boolean).map((c) => c.mood);
  const mean = moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : null;
  const label = moods.length
    ? `Mood over the last ${n} days: ${moods.length} check-in${moods.length === 1 ? "" : "s"}, average ${mean.toFixed(1)} out of 5, most recent ${MOODS[moods.at(-1) - 1]}.`
    : `No check-ins in the last ${n} days.`;
  return (
    <figure className="m-0">
      <div className="flex items-stretch gap-3">
        <div className="flex flex-col justify-between py-1 text-xs text-ink-3" aria-hidden="true">
          <span>{MOODS[4]}</span>
          <span>{MOODS[2]}</span>
          <span>{MOODS[0]}</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full min-w-0 overflow-visible" role="img" aria-label={label}>
          {[1, 2, 3, 4, 5].map((mood) => (
            <line key={mood} x1="0" x2={W} y1={y(mood)} y2={y(mood)} stroke="var(--line)" strokeWidth="1" strokeDasharray={mood === 3 ? undefined : "2 5"} vectorEffect="non-scaling-stroke" />
          ))}
          {d && <motion.path d={d} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: EASE }} />}
          {logged.map(([cx, cy], i) => (
            <motion.circle key={cx} cx={cx} cy={cy} r={i === logged.length - 1 ? 4 : 2.6} fill={i === logged.length - 1 ? "var(--brand)" : "var(--surface)"} stroke="var(--brand)" strokeWidth="1.6" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 + (i / logged.length) * 1.1 }} />
          ))}
        </svg>
      </div>
      <figcaption className="mt-2 flex justify-between pl-12 text-xs text-ink-3">
        <span>{shortDate(shiftKey(today, -(n - 1)))}</span>
        <span>Today</span>
      </figcaption>
    </figure>
  );
}

// Average mood by weekday. `pattern` comes from weekdayPattern(): Monday first.
export function WeekdayBars({ pattern }) {
  return (
    <ul className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
      {pattern.map(({ count, mood }, i) => (
        <li key={WEEKDAYS[i]} className="text-center">
          <span className="sr-only">
            {WEEKDAYS[i]}: {count ? `average ${mood.toFixed(1)} out of 5 from ${count} check-in${count === 1 ? "" : "s"}` : "no check-ins yet"}
          </span>
          <div aria-hidden="true">
            <div className="relative h-24 overflow-hidden rounded-[var(--r-sm)] bg-sunken">
              {count > 0 && <motion.div className="absolute inset-0 origin-bottom rounded-[var(--r-sm)] bg-brand" initial={{ scaleY: 0 }} whileInView={{ scaleY: mood / 5 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: EASE, delay: i * 0.06 }} />}
            </div>
            <div className="mt-2 text-xs font-medium text-ink">{WEEKDAYS[i].slice(0, 3)}</div>
            <div className="num text-xs text-ink-3">{count ? mood.toFixed(1) : "–"}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

// The last seven days as small bars: taller is a better day, a dot is a day not logged.
export function WeekStrip({ slots, today }) {
  const logged = slots.filter(Boolean).length;
  return (
    <div className="flex items-end gap-1.5" role="img" aria-label={`Last ${slots.length} days: ${logged} check-in${logged === 1 ? "" : "s"}.`}>
      {slots.map((c, i) => {
        const key = shiftKey(today, i - (slots.length - 1));
        return (
          <div key={key} className="grid w-6 justify-items-center gap-1">
            <div className="flex h-9 items-end">
              {c ? (
                <motion.div className="w-2 origin-bottom rounded-full bg-brand" style={{ height: `${(c.mood / 5) * 100}%` }} initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: EASE, delay: i * 0.05 }} />
              ) : (
                <div className="h-2 w-2 rounded-full bg-ink-3/30" />
              )}
            </div>
            <span className={`text-[0.6875rem] ${key === today ? "font-semibold text-ink" : "text-ink-3"}`}>{parseKey(key).toLocaleDateString(undefined, { weekday: "narrow" })}</span>
          </div>
        );
      })}
    </div>
  );
}
