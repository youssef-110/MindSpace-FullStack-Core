import { CountUp, Ring, Sky } from "../ui";
import { Radar } from "./ResultCharts";

const fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
const decimals = (n) => Math.min(2, (String(n).split(".")[1] ?? "").length);
const took = (s) => (s < 60 ? `${s} s` : `${Math.floor(s / 60)} min${s % 60 ? ` ${s % 60} s` : ""}`);

// On paper the sky is dropped: plain black text on white, whatever the browser's background setting.
const PRINT = "print:rounded-none print:border print:border-line print:bg-none print:p-6 print:text-black print:before:hidden print:[&>div[aria-hidden]]:hidden print:[--sunken:#e6e6e6]";
const NUMBER = "display leading-none print:text-black";

function Big({ value, unit }) {
  return (
    <p className={`${NUMBER} text-[5rem] sm:text-[6.5rem]`}>
      <CountUp value={value} decimals={decimals(value)} />
      {unit && <span className="ml-2 font-sans text-2xl font-medium tracking-[-0.02em] opacity-85">{unit}</span>}
    </p>
  );
}

function Dial({ value, min = 0, max, label }) {
  return (
    <Ring value={value} min={min} max={max} size={184} stroke={12} color="currentColor" label={label}>
      <div>
        <CountUp value={value} decimals={decimals(value)} className={`${NUMBER} block text-[3.5rem]`} />
        <span className="num mt-1 block text-sm font-medium opacity-85">of {max}</span>
      </div>
    </Ring>
  );
}

// What the panel says for each result shape: [headline, supporting line, the visual that draws itself in].
function parts(r) {
  if (r.type === "sum") {
    const scale = `on a scale from ${r.min ?? 0} to ${r.max}`;
    const plain = r.unit || !Number.isFinite(r.max);
    return [r.band?.level, plain ? null : `${r.score} ${scale}`, plain ? <Big value={r.score} unit={r.unit} /> : <Dial value={r.score} min={r.min ?? 0} max={r.max} label={`${r.score} ${scale}`} />];
  }
  if (r.type === "threshold") {
    return [
      r.positive ? "At or above the research cut-off" : "Below the research cut-off",
      `${r.score} of ${r.max}. The research cut-off is ${r.cutoff}.`,
      <Dial value={r.score} max={r.max} label={`${r.score} of ${r.max}, threshold ${r.cutoff}`} />,
    ];
  }
  if (r.type === "matrix") {
    const time = r.seconds ? ` in ${r.seconds < 60 ? "under a minute" : `${Math.round(r.seconds / 60)} min`}` : "";
    return ["Your practice IQ estimate", `Likely range ${r.low} to ${r.high}. ${r.correct} of ${r.total} correct${time}.`, <Big value={r.estimate} />];
  }
  if (r.type === "traits") {
    const n = r.traits.length;
    return ["Your profile", `${n} ${n === 1 ? "score" : "scores"}, each on its own scale.`, n >= 3 ? <div className="w-[300px] max-w-full"><Radar traits={r.traits} /></div> : null];
  }
  return [null, null, null];
}

// The header of a result: test name, date and the headline number or level, in white on the dusk sky.
export default function ScoreHero({ test, entry }) {
  const r = entry.result;
  const [title, sub, visual] = parts(r);
  const q = r.quality;
  return (
    // Not a <header>: the print stylesheet hides every header element.
    <Sky as="div" className={`rounded-[var(--r-xl)] px-6 pb-32 pt-8 [--sunken:rgba(255,255,255,0.24)] sm:px-10 sm:pb-36 sm:pt-10 ${PRINT}`}>
      <div className="grid items-center gap-8 md:grid-cols-[1fr_auto] md:gap-12">
        <div className="sky-text print:[text-shadow:none]">
          <p className="text-sm font-medium opacity-90">
            {test.instrument} · {fmtDate(entry.date)}
            {q && !q.flags?.length && q.seconds > 0 && ` · took ${took(q.seconds)}`}
          </p>
          <h1 className="mt-3 text-[2.25rem] sm:text-5xl print:text-black">{test.name}</h1>
          {title && <p className="display mt-6 text-[1.75rem] leading-[1.08] sm:text-[2.25rem] print:text-black">{title}</p>}
          {sub && <p className="num mt-2 max-w-md opacity-90">{sub}</p>}
        </div>
        {visual && <div className="justify-self-center md:justify-self-end">{visual}</div>}
      </div>
    </Sky>
  );
}
