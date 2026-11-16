import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Icon, EASE } from "../ui";
import { byId } from "../../lib/tests/questionnaires";
import { headline, plural } from "./shape";

const PAGE = 12;
const monthOf = (iso) => new Date(iso).toLocaleDateString(undefined, { month: "long", year: "numeric" });
const dayOf = (iso) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });

function Row({ entry, confirming, onAsk, onCancel, onDelete }) {
  const test = byId(entry.testId);
  return (
    <motion.li layout="position" exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: EASE }} className="flex items-center gap-2 border-t border-line first:border-t-0">
      <Link to={`/results/${entry.id}`} className="group flex min-h-16 min-w-0 flex-1 items-center justify-between gap-4 py-3 pl-5">
        <span className="min-w-0">
          <span className="block font-semibold text-ink transition-colors group-hover:text-brand-text">{test.name}</span>
          <span className="num block truncate text-sm text-ink-3">{headline(entry.result)}</span>
        </span>
        <span className="num shrink-0 text-sm text-ink-3">{dayOf(entry.date)}</span>
      </Link>
      {confirming ? (
        <span className="flex shrink-0 items-center gap-1.5 pr-3" role="group" aria-label={`Delete the ${test.name} result from ${dayOf(entry.date)}?`}>
          <button type="button" className="btn btn-sm btn-soft text-rose" onClick={onDelete}>
            Delete
          </button>
          <button type="button" className="btn btn-sm btn-soft" onClick={onCancel} autoFocus>
            Keep
          </button>
        </span>
      ) : (
        <button type="button" onClick={onAsk} aria-label={`Delete the ${test.name} result from ${dayOf(entry.date)}`} className="mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink-3 transition-colors hover:bg-sunken hover:text-rose">
          <Icon name="trash" size={19} />
        </button>
      )}
    </motion.li>
  );
}

// Every saved result, newest first, grouped by month. Deleting asks once, inline.
export default function History({ results, onDelete }) {
  const [confirmId, setConfirmId] = useState(null);
  const [all, setAll] = useState(false);
  const shown = all ? results : results.slice(0, PAGE);
  const months = [];
  for (const e of shown) {
    const label = monthOf(e.date);
    if (months.at(-1)?.label !== label) months.push({ label, entries: [] });
    months.at(-1).entries.push(e);
  }
  return (
    <section aria-labelledby="history-heading">
      <h2 id="history-heading" className="text-[2rem]">
        All results
      </h2>
      <p className="mt-2 text-ink-3">{plural(results.length, "result")} saved. Open one for the full reading, or remove it from this device.</p>
      <div className="mt-5 grid gap-6">
        {months.map((m) => (
          <div key={m.label}>
            <h3 className="eyebrow mb-2">{m.label}</h3>
            <ul className="card overflow-hidden">
              <AnimatePresence initial={false}>
                {m.entries.map((e) => (
                  <Row key={e.id} entry={e} confirming={confirmId === e.id} onAsk={() => setConfirmId(e.id)} onCancel={() => setConfirmId(null)} onDelete={() => onDelete(e.id)} />
                ))}
              </AnimatePresence>
            </ul>
          </div>
        ))}
      </div>
      {results.length > PAGE && !all && (
        <button type="button" className="btn btn-soft mt-5" onClick={() => setAll(true)}>
          Show all {results.length} results
        </button>
      )}
    </section>
  );
}
