import { Link } from "react-router-dom";
import { questionnaires, CATEGORIES } from "../lib/tests/questionnaires";
import { getResults } from "../lib/storage";

export default function Tests() {
  const taken = new Set(getResults().map((r) => r.testId));
  return (
    <div className="py-10">
      <h1 className="text-4xl sm:text-5xl font-semibold">Tests</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-2">
        Published research instruments, scored exactly as their authors specify. Each test page says what it measures, what it
        can't, and where it comes from.
      </p>

      {CATEGORIES.map((c) => (
        <section key={c.id} className="mt-12" aria-labelledby={`cat-${c.id}`}>
          <h2 id={`cat-${c.id}`} className="text-2xl font-semibold">{c.name}</h2>
          <p className="text-ink-2 mb-4">{c.blurb}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {questionnaires.filter((q) => q.category === c.id).map((q) => (
              <Link key={q.id} to={`/tests/${q.id}`} className="panel flex flex-col p-5 transition-transform hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold">{q.name}</h3>
                  {taken.has(q.id) && <span className="tag text-sage shrink-0">Taken</span>}
                </div>
                <p className="mt-1 text-sm text-ink-2">{q.instrument}</p>
                <p className="mt-3 flex-1 text-[0.95rem]">{q.measures}</p>
                <span className="tag mt-4 self-start">{q.minutes} min</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
