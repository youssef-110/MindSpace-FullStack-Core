import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { questionnaires, CATEGORIES } from "../lib/tests/questionnaires";
import { BLUEPRINTS, TIME_LIMIT_SEC } from "../lib/tests/matrix";
import { getResults, load } from "../lib/storage";
import { Icon, PageHeader, Stagger, StaggerItem } from "../components/ui";

const fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
const itemCount = (q) => (q.scoring.type === "matrix" ? BLUEPRINTS.length : q.items?.length ?? 0);

// What this browser already knows about each test: the latest result date and any unfinished draft.
function readStatus() {
  const now = Date.now();
  const last = {};
  for (const r of getResults()) if (!last[r.testId] || r.date > last[r.testId]) last[r.testId] = r.date;
  const draft = {};
  for (const q of questionnaires) {
    const d = load(`draft:${q.id}`, null);
    const started = Array.isArray(d?.answers) && d.answers.some((a) => a !== null && a !== -1);
    // A timed draft past its limit is dropped by the test page, so it is not offered here either.
    const expired = q.scoring.type === "matrix" && now - (d?.startedAt ?? 0) > TIME_LIMIT_SEC * 1000;
    if (started && !expired) draft[q.id] = true;
  }
  return { last, draft };
}

function TestCard({ q, last, draft }) {
  const count = itemCount(q);
  return (
    <Link to={`/tests/${q.id}`} className="card card-hover group flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[1.1875rem]">{q.name}</h3>
        {draft ? (
          <span className="tag tag-brand shrink-0">Continue</span>
        ) : (
          last && (
            <span className="tag tag-good shrink-0">
              <Icon name="check" size={12} strokeWidth={2.4} />
              Taken {fmtDate(last)}
            </span>
          )
        )}
      </div>
      <p className="mt-1 text-sm text-ink-3">{q.instrument}</p>
      <p className="mt-3 flex-1 text-[0.9375rem]">{q.measures}</p>
      <div className="mt-5 flex items-center gap-2">
        <span className="tag num">
          <Icon name="clock" size={13} />
          {q.minutes} min
        </span>
        {count > 0 && <span className="tag num">{count} {q.scoring.type === "matrix" ? "puzzles" : "items"}</span>}
        <span className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-sunken text-ink transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">
          <Icon name="arrow" size={17} />
        </span>
      </div>
    </Link>
  );
}

export default function Tests() {
  const [{ last, draft }] = useState(readStatus);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const { hash } = useLocation();

  // Home links to /tests#<category id>.
  useEffect(() => {
    const el = hash && document.getElementById(hash.slice(1));
    if (!el) return;
    const frame = requestAnimationFrame(() => el.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [hash]);

  const known = new Set(CATEGORIES.map((c) => c.id));
  const groups = [...CATEGORIES, { id: "other", name: "More tests", blurb: "" }]
    .map((c) => ({ ...c, tests: questionnaires.filter((t) => (c.id === "other" ? !known.has(t.category) : t.category === c.id)) }))
    .filter((c) => c.tests.length);

  const needle = query.trim().toLowerCase();
  const shown = groups
    .filter((c) => filter === "all" || c.id === filter)
    .map((c) => ({ ...c, tests: needle ? c.tests.filter((t) => `${t.name} ${t.instrument}`.toLowerCase().includes(needle)) : c.tests }))
    .filter((c) => c.tests.length);
  const total = shown.reduce((n, c) => n + c.tests.length, 0);

  return (
    <div>
      <PageHeader
        eyebrow={`${questionnaires.length} tests in ${groups.length} areas`}
        title="Tests"
        lead="Published research instruments, scored exactly as their authors specify. Each test page says what it measures, what it can't, and where it comes from."
      >
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or instrument" aria-label="Search tests" className="input mt-6 max-w-md rounded-full px-5" />
      </PageHeader>

      <div className="pointer-events-none sticky top-[76px] z-30 mb-8 sm:top-[84px]">
        <div className="glass pointer-events-auto inline-flex max-w-full gap-1 overflow-x-auto rounded-full p-1 shadow-[var(--halo-ring)] [scrollbar-width:none]" role="group" aria-label="Filter by category">
          {[{ id: "all", name: "All" }, ...groups].map((c) => {
            const active = filter === c.id;
            return (
              <button key={c.id} onClick={() => setFilter(c.id)} aria-pressed={active} className={`relative min-h-11 shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors ${active ? "text-brand-text" : "text-ink-3 hover:text-ink"}`}>
                {active && <motion.span layoutId="tests-filter" className="absolute inset-0 rounded-full bg-brand-soft" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                <span className="relative">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {total} {total === 1 ? "test" : "tests"} shown
      </p>

      <div className="space-y-14 md:space-y-20">
        {shown.map((c) => (
          <section key={c.id} id={c.id} className="scroll-mt-40" aria-labelledby={`cat-${c.id}`}>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <div>
                <h2 id={`cat-${c.id}`} className="text-[2rem] sm:text-[2.5rem]">
                  {c.name}
                </h2>
                {c.blurb && <p className="mt-2 max-w-xl">{c.blurb}</p>}
              </div>
              <p className="eyebrow num">
                {c.tests.length} {c.tests.length === 1 ? "test" : "tests"}
              </p>
            </div>
            <Stagger as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" gap={0.05}>
              {c.tests.map((q) => (
                <StaggerItem as="li" key={q.id}>
                  <TestCard q={q} last={last[q.id]} draft={draft[q.id]} />
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        ))}
      </div>

      {total === 0 && (
        <div className="well mx-auto max-w-md p-8 text-center">
          <p className="font-semibold text-ink">No tests match that search</p>
          <p className="mt-1 text-sm text-ink-3">Try a shorter word, or part of an instrument name.</p>
          <button
            className="btn btn-soft mt-5"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
          >
            Show all tests
          </button>
        </div>
      )}
    </div>
  );
}
