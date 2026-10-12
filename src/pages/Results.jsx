import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { byId } from "../lib/tests/questionnaires";
import { getResults, exportData, importData } from "../lib/storage";

function headline(r) {
  if (r.type === "traits") return r.traits.map((t) => `${t.key} ${t.score}`).join("  ");
  if (r.type === "sum") return `${r.score}/${r.max} · ${r.band.level}`;
  if (r.type === "threshold") return `${r.score}/${r.max} · ${r.positive ? "at or above threshold" : "below threshold"}`;
  if (r.type === "matrix") return `Estimate ${r.estimate} (${r.low}–${r.high})`;
  return "";
}

export default function Results() {
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
      <p className="mt-3 text-lg text-ink-2">Saved only in this browser. Take a test again any time to see how you've changed.</p>

      {results.length === 0 ? (
        <div className="panel mt-8 p-8 text-center">
          <h2 className="text-2xl font-bold">No results yet</h2>
          <p className="mt-2 text-ink-2">Your first one takes about two minutes.</p>
          <Link to="/tests" className="btn btn-primary mt-5">Choose a test</Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-line border-y border-line">
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
