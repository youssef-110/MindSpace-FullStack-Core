import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { lessons, lessonById } from "../lib/learn";
import { byId } from "../lib/tests/questionnaires";
import { saveQuizScore } from "../lib/storage";
import { Icon } from "../components/ui";
import { rng } from "../lib/tests/matrix";

// Options are stored with the right answer first; show them in a stable shuffled order.
function order(n, seed) {
  const r = rng(seed);
  const idx = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

function Quiz({ lesson }) {
  const [answers, setAnswers] = useState({});
  const orders = useMemo(() => lesson.quiz.map((q, i) => order(q[1].length, (i + 1) * 9973 + lesson.id.length * 31)), [lesson]);
  const finished = Object.keys(answers).length === lesson.quiz.length;
  const correct = lesson.quiz.filter((q, i) => answers[i] === q[2]).length;

  function choose(qi, oi) {
    if (answers[qi] !== undefined) return;
    const next = { ...answers, [qi]: oi };
    setAnswers(next);
    if (Object.keys(next).length === lesson.quiz.length) {
      saveQuizScore(lesson.id, lesson.quiz.filter((q, i) => next[i] === q[2]).length, lesson.quiz.length);
    }
  }

  return (
    <section className="mt-12" aria-labelledby="quiz">
      <h2 id="quiz" className="text-2xl font-bold mb-5">Check your understanding</h2>
      <ol className="space-y-6">
        {lesson.quiz.map(([q, opts, right, why], qi) => (
          <li key={q} className="panel p-5">
            <p className="font-bold mb-3">{qi + 1}. {q}</p>
            <div className="grid gap-2">
              {orders[qi].map((oi) => {
                const chosen = answers[qi] === oi;
                const revealed = answers[qi] !== undefined;
                const style = revealed && oi === right ? "border-sage bg-sage/10" : chosen ? "border-rose bg-rose/10" : "border-line";
                return (
                  <button
                    key={oi}
                    onClick={() => choose(qi, oi)}
                    disabled={revealed}
                    className={`min-h-[48px] rounded-[var(--r-sm)] border-2 px-4 py-2.5 text-left transition-colors disabled:cursor-default ${style} ${!revealed ? "hover:border-ink-2" : ""}`}
                  >
                    {opts[oi]}
                  </button>
                );
              })}
            </div>
            {answers[qi] !== undefined && (
              <p className="mt-3 text-[0.95rem] text-ink-2" aria-live="polite">
                <strong className={answers[qi] === right ? "text-sage" : "text-rose"}>{answers[qi] === right ? "Correct. " : "Not quite. "}</strong>
                {why}
              </p>
            )}
          </li>
        ))}
      </ol>
      {finished && (
        <p className="mt-6 text-lg font-bold" aria-live="polite">You got {correct} of {lesson.quiz.length}.</p>
      )}
    </section>
  );
}

export default function Lesson() {
  const { id } = useParams();
  const lesson = lessonById(id);
  if (!lesson) return <p className="py-20">Lesson not found. <Link to="/learn" className="link">See all lessons</Link></p>;
  const test = lesson.test && byId(lesson.test);
  const next = lessons[(lessons.indexOf(lesson) + 1) % lessons.length];

  return (
    <article className="mx-auto max-w-3xl py-10">
      <Link to="/learn" className="inline-flex items-center gap-1 text-sm font-bold text-ink-2 hover:text-ink">
        <Icon name="back" size={16} /> All lessons
      </Link>
      <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold">{lesson.title}</h1>
      <p className="mt-3 text-lg text-ink-2">{lesson.summary}</p>

      <div className="prose-lesson mt-10 space-y-8">
        {lesson.sections.map(([h, body]) => (
          <section key={h}>
            <h2 className="text-2xl font-bold mb-2">{h}</h2>
            <p>{body}</p>
          </section>
        ))}
      </div>

      <Quiz key={lesson.id} lesson={lesson} />

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {test && (
          <Link to={`/tests/${test.id}`} className="panel p-5 border-brand/40 hover:border-brand">
            <span className="text-sm text-ink-2">Put it into practice</span>
            <span className="block text-xl font-bold mt-1">Take the {test.name.toLowerCase()} test</span>
            <span className="block text-sm text-ink-2 mt-1">{test.instrument} · {test.minutes} min</span>
          </Link>
        )}
        <Link to={`/learn/${next.id}`} className="panel p-5 hover:border-ink-2">
          <span className="text-sm text-ink-2">Next lesson</span>
          <span className="block text-xl font-bold mt-1">{next.title}</span>
        </Link>
      </div>
    </article>
  );
}
