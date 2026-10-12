import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { byId } from "../lib/tests/questionnaires";
import { getResult, getResults, deleteResult } from "../lib/storage";
import { explainResult } from "../lib/ai";
import { CrisisCallout, Meter, Icon } from "../components/ui";

const TONE = { good: "text-sage", ok: "text-ink", warn: "text-amber", alert: "text-rose" };
const fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

// Only computed numbers and labels go to the AI — never the individual answers.
function summarize(r) {
  if (r.type === "traits") return { traits: Object.fromEntries(r.traits.map((t) => [t.name, `${t.score}/50 (${t.band})`])), riskFlag: r.riskFlag };
  if (r.type === "sum") return { score: r.score, max: r.max, band: r.band.level, riskFlag: r.riskFlag };
  if (r.type === "threshold") return { score: r.score, max: r.max, cutoff: r.cutoff, aboveThreshold: r.positive, riskFlag: r.riskFlag };
  if (r.type === "matrix") return { correct: r.correct, total: r.total, practiceEstimate: r.estimate, range90: `${r.low}-${r.high}` };
  return {};
}

function BellCurve({ low, high, estimate }) {
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
        <clipPath id="range"><rect x={x(low)} y="0" width={x(high) - x(low)} height="112" /></clipPath>
      </defs>
      <path d={`${path}L300 110L0 110z`} fill="var(--sunken)" />
      <motion.path d={`${path}L300 110L0 110z`} fill="var(--brand)" fillOpacity="0.28" clipPath="url(#range)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} />
      <path d={path} fill="none" stroke="var(--ink-2)" strokeWidth="1.5" />
      <line x1={x(estimate)} x2={x(estimate)} y1="8" y2="110" stroke="var(--brand)" strokeWidth="2.5" />
      <line x1="0" x2="300" y1="110" y2="110" stroke="var(--line)" />
      {[70, 85, 100, 115, 130].map((v) => (
        <text key={v} x={x(v)} y="128" textAnchor="middle" fontSize="11" fill="var(--ink-2)">{v}</text>
      ))}
    </svg>
  );
}

function Score({ test, r }) {
  if (r.type === "traits") {
    return (
      <div className="grid gap-6">
        {r.traits.map((t) => (
          <div key={t.key}>
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <h3 className="text-xl font-bold">{t.name}</h3>
              <span className="font-bold tabular-nums">{t.score}<span className="text-ink-2 font-normal"> / 50</span></span>
            </div>
            <Meter value={t.score} min={10} max={50} label={`${t.name}: ${t.score} on a 10 to 50 scale`} />
            <p className="mt-2 text-ink-2">{t.note}</p>
          </div>
        ))}
        <p className="text-sm text-ink-2">Scores run from 10 to 50, with 30 in the middle. These describe your answers, not how you rank against other people.</p>
      </div>
    );
  }
  if (r.type === "sum") {
    return (
      <div>
        <p className="font-display text-6xl font-extrabold tabular-nums">{r.score}<span className="text-2xl text-ink-2 font-bold"> / {r.max}</span></p>
        <p className={`mt-2 text-2xl font-bold ${TONE[r.band.tone]}`}>{r.band.level}</p>
        <div className="mt-4"><Meter value={r.score} max={r.max} /></div>
        <p className="mt-4 text-lg">{r.band.text}</p>
      </div>
    );
  }
  if (r.type === "threshold") {
    return (
      <div>
        <p className="font-display text-6xl font-extrabold tabular-nums">{r.score}<span className="text-2xl text-ink-2 font-bold"> / {r.max}</span></p>
        <p className="mt-2 text-2xl font-bold">{r.positive ? "At or above the screening threshold" : "Below the screening threshold"}</p>
        <div className="mt-4"><Meter value={r.score} max={r.max} cutoff={r.cutoff} label={`${r.score} of ${r.max}, threshold ${r.cutoff}`} /></div>
        <p className="mt-1 text-sm text-ink-2">The line marks the threshold of {r.cutoff}.</p>
        <p className="mt-4 text-lg">
          {r.positive
            ? test.sensitive
              ? "You reported several patterns that screeners pick up. This does not mean you have a personality disorder: many people above this line don't, especially during periods of stress, low mood or big life changes. If these patterns cause you real difficulty, talking them through with a psychologist or doctor is a good next step."
              : "Your answers match the pattern this screener is designed to flag. That's a reason to consider a professional assessment, not a diagnosis."
            : test.sensitive
              ? "You reported fewer of the patterns this screener looks for. If something still troubles you, that matters more than any score; a professional can help."
              : "Your answers don't match the pattern this screener flags. Screeners do miss some people, so if you still have concerns, it's fine to ask a professional."}
        </p>
      </div>
    );
  }
  if (r.type === "matrix") {
    return (
      <div>
        <p className="text-ink-2 font-bold">Practice estimate</p>
        <p className="font-display text-6xl font-extrabold tabular-nums">{r.estimate}</p>
        <p className="mt-1 text-lg">Likely range {r.low}–{r.high} · {r.correct} of {r.total} correct{r.seconds ? ` · ${r.seconds < 60 ? "under 1" : Math.round(r.seconds / 60)} min` : ""}</p>
        <div className="mt-6"><BellCurve low={r.low} high={r.high} estimate={r.estimate} /></div>
        <p className="mt-4 text-ink-2">
          The shaded band is a 90% range. On this scale, 100 is the intended average and two in three people fall between 85 and 115. Because our
          puzzle difficulties are design estimates rather than measured on a norm group, read this as a practice estimate, not your IQ.
        </p>
      </div>
    );
  }
  return null;
}

function AiExplain({ entry }) {
  const [state, setState] = useState({ status: "idle" });
  const run = async () => {
    setState({ status: "loading" });
    const t0 = performance.now();
    try {
      const data = await explainResult(entry.testId, summarize(entry.result));
      setState({ status: "done", data, ms: Math.round(performance.now() - t0) });
    } catch (e) {
      setState({ status: "error", message: e.message });
    }
  };
  return (
    <section className="panel p-5 sm:p-6 no-print" aria-labelledby="ai">
      <h2 id="ai" className="text-xl font-bold">Explain this result in plain words</h2>
      <p className="mt-1 text-sm text-ink-2">Sends only the scores above to the AI, never your answers. The AI can't change your score.</p>
      {state.status === "idle" && <button className="btn btn-primary mt-4" onClick={run}>Explain with AI</button>}
      {state.status === "loading" && (
        <div className="mt-4 space-y-2" aria-busy="true" aria-label="Loading explanation">
          {[90, 75, 82].map((w) => <div key={w} className="h-4 animate-pulse rounded bg-sunken" style={{ width: `${w}%` }} />)}
        </div>
      )}
      {state.status === "error" && (
        <div className="mt-4">
          <p className="text-rose font-bold">{state.message}</p>
          <p className="mt-1 text-sm text-ink-2">Your result above is complete without it.</p>
          <button className="btn btn-quiet mt-3" onClick={run}>Try again</button>
        </div>
      )}
      {state.status === "done" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
          <p>{state.data.summary}</p>
          <ul className="list-disc space-y-1.5 pl-5">{state.data.points.map((p) => <li key={p}>{p}</li>)}</ul>
          <p className="text-sm text-ink-2">{state.data.caution}</p>
          <p className="text-xs text-ink-2">AI-written, may contain mistakes{state.ms < 200 ? " · loaded from cache" : ""}.</p>
        </motion.div>
      )}
    </section>
  );
}

export default function Result() {
  const { id } = useParams();
  const navigate = useNavigate();
  const entry = getResult(id);
  if (!entry) return <p className="py-20">Result not found. <Link to="/results" className="link">See your results</Link></p>;
  const test = byId(entry.testId);
  const r = entry.result;
  const previous = getResults().find((x) => x.testId === entry.testId && x.date < entry.date);
  const prevValue = previous && (r.type === "matrix" ? previous.result.estimate : previous.result.score);
  const value = r.type === "matrix" ? r.estimate : r.score;
  const lowWellbeing = r.type === "sum" && ["warn", "alert"].includes(r.band.tone);

  return (
    <article className="mx-auto max-w-3xl py-10 space-y-10">
      <div>
        <Link to="/results" className="inline-flex items-center gap-1 text-sm font-bold text-ink-2 hover:text-ink no-print">
          <Icon name="back" size={16} /> My results
        </Link>
        <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold">{test.name}</h1>
        <p className="mt-2 text-ink-2">{test.instrument} · {fmtDate(entry.date)}</p>
      </div>

      {r.riskFlag && <CrisisCallout />}

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="panel p-5 sm:p-8">
        <Score test={test} r={r} />
        {previous && prevValue !== undefined && value !== undefined && (
          <p className="mt-6 border-t border-line pt-4 text-ink-2">
            Last time ({fmtDate(previous.date)}): <strong className="text-ink">{prevValue}</strong>
            {value !== prevValue && <> — {value > prevValue ? "up" : "down"} {Math.abs(value - prevValue)}</>}
            {value === prevValue && " — no change"}
          </p>
        )}
      </motion.section>

      {lowWellbeing && (
        <p className="rounded-[var(--r-md)] bg-sunken p-4">
          Something you can do right now: a two-minute <Link to="/breathe" className="link">breathing exercise</Link>. When you're ready,{" "}
          <Link to="/help" className="link">here's how to find support</Link>.
        </p>
      )}

      <AiExplain entry={entry} />

      <section aria-labelledby="limits">
        <h2 id="limits" className="text-2xl font-bold">Accuracy and limitations</h2>
        <p className="mt-2 text-ink-2">{test.cannot}</p>
        <p className="mt-3 text-sm text-ink-2">{test.source}</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {test.lesson && <Link to={`/learn/${test.lesson}`} className="link">Learn what this test measures</Link>}
          <Link to="/learn/how-tests-work" className="link">How psychological tests work</Link>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 no-print">
        <Link to={`/tests/${test.id}`} className="btn btn-primary">Take it again</Link>
        <button className="btn btn-quiet" onClick={() => window.print()}>Print or save as PDF</button>
        <button
          className="btn btn-quiet text-rose"
          onClick={() => {
            if (confirm("Delete this result from this device?")) {
              deleteResult(entry.id);
              navigate("/results", { replace: true });
            }
          }}
        >
          Delete result
        </button>
      </div>
    </article>
  );
}
