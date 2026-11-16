import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteResult } from "../../lib/storage";
import { QUALITY_NOTES } from "../../lib/tests/quality";
import { Icon, Sparkline } from "../ui";

const TITLE = "font-sans text-xl font-semibold tracking-[-0.02em]";
const fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

// `points` are this test's headline values, oldest first, ending with the result on screen.
export function Change({ points, prevDate, lowerIsBetter }) {
  const value = points.at(-1);
  const before = points.at(-2);
  const diff = Math.round(Math.abs(value - before) * 100) / 100;
  return (
    <section className="card flex flex-wrap items-center justify-between gap-x-8 gap-y-5 p-5 sm:p-8" aria-labelledby="change">
      <div>
        <h2 id="change" className={TITLE}>Since last time</h2>
        <p className="num mt-2 text-[1.75rem] font-semibold leading-none tracking-[-0.03em] text-ink">
          {value === before ? "No change" : `${value > before ? "Up" : "Down"} ${diff}`}
        </p>
        <p className="num mt-3 text-sm text-ink-3">
          Last time ({fmtDate(prevDate)}): <strong>{before}</strong>. {points.length} attempts so far.
          {lowerIsBetter && " Lower is better on this measure."}
        </p>
      </div>
      <Sparkline points={points} width={168} height={52} />
    </section>
  );
}

// Shown only when the answers looked careless; otherwise the time taken sits quietly in the header.
export function QualityNote({ quality }) {
  const notes = (quality?.flags ?? []).map((f) => QUALITY_NOTES[f]).filter(Boolean);
  if (!notes.length) return null;
  return (
    <section className="flex gap-4 rounded-[var(--r-lg)] border border-amber/30 bg-amber-soft p-5 sm:p-6" aria-labelledby="quality">
      <Icon name="alert" size={24} className="mt-0.5 text-amber" />
      <div>
        <h2 id="quality" className={TITLE}>Read this score with care</h2>
        {notes.map((n) => (
          <p key={n} className="mt-2">{n}</p>
        ))}
      </div>
    </section>
  );
}

export function Actions({ test, entry }) {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="no-print flex flex-wrap items-center gap-3">
      <Link to={`/tests/${test.id}`} className="btn btn-primary">
        <Icon name="refresh" size={18} />
        Take it again
      </Link>
      <button className="btn btn-ghost" onClick={() => window.print()}>
        <Icon name="print" size={18} />
        Print or save as PDF
      </button>
      {confirming ? (
        <div className="flex flex-wrap items-center gap-2 rounded-[28px] bg-rose-soft p-2 pl-5" role="group" aria-label="Confirm delete">
          <span className="mr-1 text-sm font-medium text-ink" role="status">Delete this result from this device?</span>
          <button
            className="btn btn-sm min-h-11 bg-rose text-surface"
            onClick={() => {
              deleteResult(entry.id);
              navigate("/results", { replace: true });
            }}
          >
            Delete
          </button>
          <button className="btn btn-soft btn-sm min-h-11" autoFocus onClick={() => setConfirming(false)}>Keep it</button>
        </div>
      ) : (
        <button className="btn btn-soft text-rose" onClick={() => setConfirming(true)}>
          <Icon name="trash" size={18} />
          Delete result
        </button>
      )}
    </div>
  );
}
