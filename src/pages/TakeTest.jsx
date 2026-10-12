import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { byId, scoreQuestionnaire } from "../lib/tests/questionnaires";
import { generateForm, scoreMatrix, TIME_LIMIT_SEC } from "../lib/tests/matrix";
import { load, save, saveResult } from "../lib/storage";
import MatrixCell, { MatrixGrid } from "../components/MatrixCell";
import { Icon } from "../components/ui";

const draftKey = (id) => `draft:${id}`;

function Intro({ test, draft, onStart }) {
  const answered = draft ? draft.answers.filter((a) => a !== null && a !== -1).length : 0;
  const total = test.scoring.type === "matrix" ? 24 : test.items.length;
  return (
    <div className="mx-auto max-w-3xl py-10">
      <Link to="/tests" className="inline-flex items-center gap-1 text-sm font-bold text-ink-2 hover:text-ink">
        <Icon name="back" size={16} /> All tests
      </Link>
      <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold">{test.name}</h1>
      <p className="mt-2 text-ink-2">{test.instrument} · about {test.minutes} minutes</p>

      <dl className="mt-8 grid gap-6">
        <div>
          <dt className="font-bold">What it measures</dt>
          <dd className="mt-1 text-ink-2">{test.measures}</dd>
        </div>
        <div>
          <dt className="font-bold">What it can't tell you</dt>
          <dd className="mt-1 text-ink-2">{test.cannot}</dd>
        </div>
        <div>
          <dt className="font-bold">Source</dt>
          <dd className="mt-1 text-sm text-ink-2">{test.source}</dd>
        </div>
      </dl>

      {test.sensitive && (
        <p className="mt-8 rounded-[var(--r-md)] bg-sunken p-4 text-[0.95rem]">
          This is a screener about long-standing personal patterns. Some questions are personal; answer honestly for yourself. The
          result can suggest whether talking to a professional might help, but it cannot diagnose anything.
        </p>
      )}
      {test.scoring.type === "matrix" && (
        <p className="mt-8 rounded-[var(--r-md)] bg-sunken p-4 text-[0.95rem]">
          24 puzzles, easy to hard, with a 20-minute limit. In each, find the piece that completes the 3×3 pattern. Rules run along
          the rows. You can skip and come back. Every attempt gets a fresh set of puzzles with the same difficulty.
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {draft && answered > 0 ? (
          <>
            <button className="btn btn-primary" onClick={() => onStart(draft)}>Continue ({answered}/{total} answered)</button>
            <button className="btn btn-quiet" onClick={() => onStart(null)}>Start over</button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={() => onStart(null)}>Start the test</button>
        )}
        {test.lesson && <Link to={`/learn/${test.lesson}`} className="btn btn-quiet">Read the lesson first</Link>}
      </div>
    </div>
  );
}

function Progress({ value, total }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-sunken" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={total} aria-label="Progress">
      <div className="h-1.5 rounded-full bg-brand transition-[width] duration-300" style={{ width: `${(value / total) * 100}%` }} />
    </div>
  );
}

function Questionnaire({ test, initial, onDone }) {
  const [answers, setAnswers] = useState(initial?.answers ?? test.items.map(() => null));
  const [i, setI] = useState(() => {
    const first = answers.findIndex((a) => a === null);
    return first === -1 ? test.items.length - 1 : first;
  });
  const [dir, setDir] = useState(1);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [i]);

  useEffect(() => {
    save(draftKey(test.id), { answers });
  }, [answers, test.id]);

  const choose = useCallback(
    (value) => {
      const next = answers.map((a, k) => (k === i ? value : a));
      setAnswers(next);
      if (next.every((a) => a !== null)) return onDone(next);
      setDir(1);
      setTimeout(() => setI((cur) => Math.min(cur + 1, test.items.length - 1)), 160);
    },
    [answers, i, onDone, test.items.length]
  );

  useEffect(() => {
    const onKey = (e) => {
      const n = Number(e.key);
      if (n >= 1 && n <= test.options.length) choose(test.options[n - 1].value);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose, test.options]);

  const done = answers.filter((a) => a !== null).length;
  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="flex items-center justify-between gap-4 text-sm text-ink-2 mb-2">
        <span>{test.name}</span>
        <span>{i + 1} / {test.items.length}</span>
      </div>
      <Progress value={done} total={test.items.length} />
      {test.intro && <p className="mt-6 text-ink-2">{test.intro}</p>}

      {/* Enter-only animation: an exiting copy would keep stale, clickable buttons. */}
      <motion.fieldset
          key={i}
          initial={{ opacity: 0, x: dir * 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-4"
        >
          <legend className="font-display text-2xl sm:text-3xl font-bold leading-snug">{test.items[i]}</legend>
          <div className="mt-6 grid gap-2.5">
            {test.options.map((o, k) => (
              <button
                key={o.label}
                onClick={() => choose(o.value)}
                aria-pressed={answers[i] === o.value}
                className={`flex min-h-[52px] items-center gap-3 rounded-[var(--r-md)] border-2 px-4 py-3 text-left font-bold transition-colors ${
                  answers[i] === o.value ? "border-brand bg-brand/10" : "border-line bg-surface hover:border-ink-2"
                }`}
              >
                <span className="hidden sm:grid h-7 w-7 shrink-0 place-items-center rounded-md bg-sunken text-sm text-ink-2" aria-hidden="true">{k + 1}</span>
                {o.label}
              </button>
            ))}
          </div>
        </motion.fieldset>

      <div className="mt-6 flex justify-between">
        <button className="btn btn-quiet" disabled={i === 0} onClick={() => { setDir(-1); setI(i - 1); }}>Back</button>
        {answers[i] !== null && i < test.items.length - 1 && (
          <button className="btn btn-quiet" onClick={() => { setDir(1); setI(i + 1); }}>Next</button>
        )}
      </div>
    </div>
  );
}

function MatrixRunner({ initial, onDone }) {
  const [state, setState] = useState(
    () => initial ?? { seed: Math.floor(Math.random() * 2 ** 31), answers: Array(24).fill(-1), startedAt: Date.now() }
  );
  const form = useMemo(() => generateForm(state.seed), [state.seed]);
  const [i, setI] = useState(() => Math.max(0, state.answers.indexOf(-1)));
  const [now, setNow] = useState(() => Date.now());
  const finished = useRef(false);
  const finish = useCallback(() => {
    if (finished.current) return; // the timer and the button can both fire
    finished.current = true;
    onDone(state, form);
  }, [onDone, state, form]);
  const left = Math.max(0, TIME_LIMIT_SEC - Math.floor((now - state.startedAt) / 1000));

  useEffect(() => {
    save(draftKey("matrix"), state);
  }, [state]);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (left === 0) finish();
  }, [left, finish]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [i]);
  const item = form[i];
  const answered = state.answers.filter((a) => a !== -1).length;
  const pick = (k) => {
    setState((s) => ({ ...s, answers: s.answers.map((a, j) => (j === i ? k : a)) }));
    if (i < 23) setTimeout(() => setI(i + 1), 220);
  };

  return (
    <div className="mx-auto max-w-2xl py-6">
      <div className="flex items-center justify-between gap-4 text-sm mb-2">
        <span className="text-ink-2">Puzzle {i + 1} of 24</span>
        <span className={`font-bold tabular-nums ${left < 120 ? "text-rose" : ""}`} aria-live={left < 60 ? "polite" : "off"}>
          {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")} left
        </span>
      </div>
      <Progress value={answered} total={24} />

      <div className="mt-5 mx-auto max-w-[340px] text-ink">
        <MatrixGrid cells={item.cells} />
      </div>
      <p className="mt-4 mb-2 text-center text-sm text-ink-2">Choose the missing piece</p>
      <div className="grid grid-cols-4 gap-2 sm:gap-3" role="radiogroup" aria-label={`Answers for puzzle ${i + 1}`}>
        {item.options.map((o, k) => (
          <button
            key={k}
            role="radio"
            aria-checked={state.answers[i] === k}
            aria-label={`Option ${k + 1}`}
            onClick={() => pick(k)}
            className={`aspect-square rounded-[var(--r-sm)] border-2 bg-surface p-1.5 transition-colors ${
              state.answers[i] === k ? "border-brand bg-brand/10" : "border-line hover:border-ink-2"
            }`}
          >
            <MatrixCell cell={o} label={`Option ${k + 1}`} />
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button className="btn btn-quiet" disabled={i === 0} onClick={() => setI(i - 1)}>Back</button>
          <button className="btn btn-quiet" disabled={i === 23} onClick={() => setI(i + 1)}>Skip</button>
        </div>
        <button className="btn btn-primary" onClick={finish}>
          {answered === 24 ? "See my result" : `Finish (${answered}/24)`}
        </button>
      </div>
      <div className="mt-5 flex flex-wrap gap-1.5" aria-label="Jump to puzzle">
        {form.map((_, k) => (
          <button
            key={k}
            onClick={() => setI(k)}
            aria-label={`Puzzle ${k + 1}${state.answers[k] !== -1 ? ", answered" : ""}`}
            className={`h-8 w-8 rounded-md text-xs font-bold ${k === i ? "bg-ink text-paper" : state.answers[k] !== -1 ? "bg-brand/20" : "bg-sunken text-ink-2"}`}
          >
            {k + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TakeTest() {
  const { id } = useParams();
  const test = byId(id);
  const navigate = useNavigate();
  const [running, setRunning] = useState(null); // null | { initial }
  const [openedAt] = useState(() => Date.now());

  const finishQuestionnaire = useCallback(
    (answers) => {
      const entry = saveResult(test.id, scoreQuestionnaire(test, answers));
      save(draftKey(test.id), null);
      navigate(`/results/${entry.id}`, { replace: true });
    },
    [test, navigate]
  );
  const finishMatrix = useCallback(
    (state, form) => {
      const entry = saveResult("matrix", { ...scoreMatrix(form, state.answers), seed: state.seed, seconds: Math.round((Date.now() - state.startedAt) / 1000) });
      save(draftKey("matrix"), null);
      navigate(`/results/${entry.id}`, { replace: true });
    },
    [navigate]
  );

  if (!test) return <p className="py-20">Test not found. <Link to="/tests" className="link">See all tests</Link></p>;
  const draft = load(draftKey(test.id), null);
  // A matrix draft past its time limit is dropped rather than resumed.
  const expired = draft && test.scoring.type === "matrix" && openedAt - draft.startedAt > TIME_LIMIT_SEC * 1000;

  if (!running) {
    return (
      <Intro
        test={test}
        draft={expired ? null : draft}
        onStart={(d) => {
          if (!d) save(draftKey(test.id), null);
          setRunning({ initial: d });
        }}
      />
    );
  }
  return test.scoring.type === "matrix" ? (
    <MatrixRunner initial={running.initial} onDone={finishMatrix} />
  ) : (
    <Questionnaire test={test} initial={running.initial} onDone={finishQuestionnaire} />
  );
}
