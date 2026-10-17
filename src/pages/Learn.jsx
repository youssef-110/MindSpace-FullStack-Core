import { Link } from "react-router-dom";
import { lessons } from "../lib/learn";
import { getProgress } from "../lib/storage";

export default function Learn() {
  const progress = getProgress();
  const tracks = [...new Set(lessons.map((l) => l.track))];
  const done = lessons.filter((l) => progress[l.id]).length;

  return (
    <div className="py-10">
      <h1 className="text-4xl sm:text-5xl font-semibold">Lessons</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-2">
        Each lesson takes a few minutes, ends with a three-question check, and links to the test it explains.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <div className="h-2 w-48 rounded-full bg-sunken" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={lessons.length} aria-label="Lessons completed">
          <div className="h-2 rounded-full bg-sage" style={{ width: `${(done / lessons.length) * 100}%` }} />
        </div>
        <span className="text-sm text-ink-2">{done} of {lessons.length} completed</span>
      </div>

      {tracks.map((track) => (
        <section key={track} className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">{track}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.filter((l) => l.track === track).map((l) => {
              const p = progress[l.id];
              return (
                <Link key={l.id} to={`/learn/${l.id}`} className="panel flex flex-col p-5 transition-transform hover:-translate-y-0.5">
                  <h3 className="text-xl font-semibold">{l.title}</h3>
                  <p className="mt-1.5 flex-1 text-[0.95rem] text-ink-2">{l.summary}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="tag">{l.minutes} min read</span>
                    {p && <span className="tag text-sage">Quiz {p.correct}/{p.total}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
