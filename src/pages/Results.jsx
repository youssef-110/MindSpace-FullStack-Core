import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { byId } from "../lib/tests/questionnaires";
import { getResults, getProgress, exportData, importData } from "../lib/storage";
import { lessons } from "../lib/learn";
import { useAuth } from "../lib/auth-context";

function headline(r) {
  if (r.type === "traits") return r.traits.map((t) => `${t.key} ${t.score}`).join("  ");
  if (r.type === "sum") return `${r.score}/${r.max}, ${r.band.level}`;
  if (r.type === "threshold") return `${r.score}/${r.max}, ${r.positive ? "at or above threshold" : "below threshold"}`;
  if (r.type === "matrix") return `Estimate ${r.estimate} (${r.low} to ${r.high})`;
  return "";
}

const value = (r) => (r.type === "matrix" ? r.estimate : r.type === "traits" ? null : r.score);

// Small trend line for tests taken more than once (oldest to newest).
function Sparkline({ points, min, max }) {
  const w = 96;
  const h = 28;
  const lo = min ?? Math.min(...points);
  const hi = max ?? Math.max(...points);
  const y = (v) => h - 3 - ((v - lo) / (hi - lo || 1)) * (h - 6);
  const x = (i) => (i / (points.length - 1)) * (w - 6) + 3;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="shrink-0 text-brand">
      <polyline points={points.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(points.length - 1)} cy={y(points.at(-1))} r="3" fill="currentColor" />
    </svg>
  );
}

function Overview({ results }) {
  const progress = getProgress();
  const done = lessons.filter((l) => progress[l.id]).length;
  const groups = {};
  for (const e of results) (groups[e.testId] ||= []).push(e);
  const byTest = Object.values(groups).filter((list) => byId(list[0].testId));
  const repeated = byTest.filter((list) => list.length > 1 && value(list[0].result) !== null);
  return (
    <section className="mt-8" aria-labelledby="overview">
      <h2 id="overview" className="sr-only">Progress overview</h2>
      <div className="grid gap-px overflow-hidden rounded-[var(--r-lg)] border border-line bg-line sm:grid-cols-3">
        <div className="bg-surface p-5">
          <p className="text-sm text-ink-2">Lessons completed</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums">{done}<span className="text-lg text-ink-2"> / {lessons.length}</span></p>
          <div className="mt-3 h-1.5 rounded-full bg-sunken"><div className="h-1.5 rounded-full bg-sage" style={{ width: `${(done / lessons.length) * 100}%` }} /></div>
        </div>
        <div className="bg-surface p-5">
          <p className="text-sm text-ink-2">Different tests taken</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums">{byTest.length}</p>
        </div>
        <div className="bg-surface p-5">
          <p className="text-sm text-ink-2">Results saved</p>
          <p className="mt-1 font-display text-3xl font-bold tabular-nums">{results.length}</p>
        </div>
      </div>
      {repeated.length > 0 && (
        <>
          <h3 className="mt-10 text-xl font-bold">Changes over time</h3>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {repeated.map((list) => {
              const test = byId(list[0].testId);
              const pts = [...list].reverse().map((e) => value(e.result));
              const r = list[0].result;
              return (
                <li key={test.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="min-w-0">
                    <span className="block font-bold">{test.name}</span>
                    <span className="block text-sm text-ink-2 tabular-nums">{pts.length} attempts. First {pts[0]}, latest {pts.at(-1)}</span>
                  </span>
                  <Sparkline points={pts} min={r.type === "matrix" ? undefined : (r.min ?? 0)} max={r.type === "matrix" ? undefined : r.max} />
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}

export default function Results() {
  const { user, consent } = useAuth();
  const [results, setResults] = useState(getResults);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);

  const download = () => {
    const url = URL.createObjectURL(new Blob([exportData()], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `mindspace-backup-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
    URL.revokeObjectURL(url);
  };
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const n = importData(await file.text());
      setResults(getResults());
      setMsg(`Imported ${n} result${n === 1 ? "" : "s"}.`);
    } catch (err) {
      setMsg(err instanceof SyntaxError ? "That file isn't valid JSON." : err.message);
    }
    e.target.value = "";
  };

  return (
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="text-4xl sm:text-5xl font-extrabold">My results</h1>
      <p className="mt-3 text-lg text-ink-2">
        {user
          ? consent
            ? "Saved in this browser and in your account. Take a test again any time to see how you've changed."
            : "Saved in this browser. Lesson progress syncs to your account, and you can turn on result syncing from your account page."
          : "Saved only in this browser. Sign in to keep your progress across devices."}
      </p>
      {results.length > 0 && <Overview results={results} />}
      {results.length > 0 && <h2 className="mt-10 text-xl font-bold">All results</h2>}

      {results.length === 0 ? (
        <div className="panel mt-8 p-8 text-center">
          <h2 className="text-2xl font-bold">No results yet</h2>
          <p className="mt-2 text-ink-2">Your first one takes about two minutes.</p>
          <Link to="/tests" className="btn btn-primary mt-5">Choose a test</Link>
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {results.map((e) => {
            const test = byId(e.testId);
            if (!test) return null;
            return (
              <li key={e.id}>
                <Link to={`/results/${e.id}`} className="group flex items-center justify-between gap-4 py-4">
                  <span className="min-w-0">
                    <span className="block font-bold group-hover:text-brand">{test.name}</span>
                    <span className="block truncate text-sm text-ink-2 tabular-nums">{headline(e.result)}</span>
                  </span>
                  <span className="shrink-0 text-sm text-ink-2">{new Date(e.date).toLocaleDateString()}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <section className="mt-12" aria-labelledby="backup">
        <h2 id="backup" className="text-xl font-bold">Back up or move your results</h2>
        <p className="mt-1 text-ink-2">Clearing your browser data deletes your results. Download a backup file to keep them or move them to another device.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="btn btn-quiet" onClick={download} disabled={!results.length}>Download backup</button>
          <button className="btn btn-quiet" onClick={() => fileRef.current?.click()}>Import backup</button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={upload} aria-label="Import backup file" />
        </div>
        {msg && <p className="mt-3 font-bold" role="status">{msg}</p>}
      </section>
    </div>
  );
}
