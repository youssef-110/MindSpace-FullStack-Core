import { Link } from "react-router-dom";
import { lessons } from "../lib/learn";
import { byId } from "../lib/tests/questionnaires";
import { getProgress } from "../lib/storage";
import { CountUp, Icon, PageHeader, Reveal, Ring, Stagger, StaggerItem } from "../components/ui";
import ReadTime from "../components/learn/ReadTime";

function LessonRow({ lesson, number, score }) {
  const test = lesson.test && byId(lesson.test);
  return (
    <article className="card card-hover relative flex gap-4 p-5 sm:gap-5 sm:p-6">
      <span className="num grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sunken text-sm font-semibold text-ink-3" aria-hidden="true">
        {String(number).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg">
          {/* The title link stretches over the whole card; the test link below sits above it. */}
          <Link to={`/learn/${lesson.id}`} className="after:absolute after:inset-0 after:rounded-[var(--r-lg)]">
            {lesson.title}
          </Link>
        </h3>
        <p className="mt-1 text-[0.9375rem] text-ink-3">{lesson.summary}</p>
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <ReadTime lesson={lesson} />
          {score && (
            <span className="tag tag-good num">
              <Icon name="check" size={14} />
              <span className="sr-only">Completed.</span>
              Quiz {score.correct}/{score.total}
            </span>
          )}
          {test && (
            // The ::before pads the tap area to 44px without making the tag taller.
            <Link to={`/tests/${test.id}`} className="tag tag-brand relative z-10 transition-opacity before:absolute before:-inset-y-2.5 before:inset-x-0 hover:opacity-80">
              <Icon name="tests" size={14} />
              Test: {test.name}
            </Link>
          )}
        </div>
      </div>
      <Icon name="chevron" size={20} className="mt-2.5 hidden text-ink-3 sm:block" />
    </article>
  );
}

export default function Learn() {
  const progress = getProgress();
  const tracks = [...new Set(lessons.map((l) => l.track))];
  const done = lessons.filter((l) => progress[l.id]).length;
  const upNext = lessons.find((l) => !progress[l.id]);

  return (
    <>
      <PageHeader eyebrow="Learn" title="Lessons" lead="Each lesson takes a few minutes, ends with a three-question check, and links to the test it explains." />

      <Reveal className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)]">
        <div className="card flex items-center gap-5 p-5 sm:p-6">
          <Ring value={done} max={lessons.length} size={92} stroke={8} label={`${done} of ${lessons.length} lessons completed`}>
            <CountUp value={done} className="display text-[1.75rem]" />
          </Ring>
          <div>
            <p className="num font-semibold text-ink">
              {done} of {lessons.length} completed
            </p>
            <p className="mt-0.5 max-w-[22ch] text-sm text-ink-3">A lesson counts once you finish its check.</p>
          </div>
        </div>

        {upNext ? (
          <Link to={`/learn/${upNext.id}`} className="card card-hover flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
            <span className="min-w-0">
              <span className="eyebrow block">{done ? "Continue where you left off" : "Start here"}</span>
              <span className="mt-1.5 block text-xl font-semibold tracking-[-0.02em] text-ink">{upNext.title}</span>
              <span className="mt-1 block text-[0.9375rem] text-ink-3">{upNext.summary}</span>
            </span>
            <span className="btn btn-primary shrink-0 self-start sm:self-center">
              {done ? "Continue" : "Begin"}
              <Icon name="arrow" size={18} />
            </span>
          </Link>
        ) : (
          <div className="card flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <p className="eyebrow">All caught up</p>
              <p className="mt-1.5 text-xl font-semibold tracking-[-0.02em] text-ink">You have finished every lesson.</p>
              <p className="mt-1 text-[0.9375rem] text-ink-3">Revisit any of them below, or put what you learned into practice.</p>
            </div>
            <Link to="/tests" className="btn btn-primary shrink-0 self-start sm:self-center">
              Browse the tests
              <Icon name="arrow" size={18} />
            </Link>
          </div>
        )}
      </Reveal>

      {tracks.map((track, t) => {
        const list = lessons.filter((l) => l.track === track);
        return (
          <section key={track ?? "more"} className="mt-16 grid gap-6 md:mt-24 md:grid-cols-[minmax(0,1fr)_minmax(0,2.5fr)] md:gap-10" aria-labelledby={`track-${t}`}>
            <Reveal className="md:sticky md:top-28 md:self-start">
              <h2 id={`track-${t}`} className="text-[1.75rem] sm:text-[2rem]">{track ?? "More lessons"}</h2>
              <p className="num mt-2 text-sm text-ink-3">
                {list.filter((l) => progress[l.id]).length} of {list.length} completed
              </p>
            </Reveal>
            <Stagger as="ol" className="grid gap-3">
              {list.map((l, i) => (
                <StaggerItem as="li" key={l.id}>
                  <LessonRow lesson={l} number={i + 1} score={progress[l.id]} />
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        );
      })}
    </>
  );
}
