import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { generateForm, TIME_LIMIT_SEC } from "../../lib/tests/matrix";
import { save } from "../../lib/storage";
import MatrixCell, { MatrixGrid } from "../MatrixCell";
import { EASE, Icon } from "../ui";
import Progress from "./Progress";

// The timed matrix test. Timer, expiry and draft logic are unchanged; only the presentation is new.
export default function MatrixFlow({ initial, onDone }) {
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
    save("draft:matrix", state);
  }, [state]);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (left === 0) finish();
  }, [left, finish]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [i]);

  const item = form[i];
  const answered = state.answers.filter((a) => a !== -1).length;
  const pick = (k) => {
    setState((s) => ({ ...s, answers: s.answers.map((a, j) => (j === i ? k : a)) }));
    if (i < 23) setTimeout(() => setI(i + 1), 220);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="sr-only">IQ test</h1>
      <Progress value={answered} total={24} label={`Puzzle ${i + 1} of 24`}>
        <span className={`tag num ${left < 120 ? "tag-alert" : ""}`} aria-live={left < 60 ? "polite" : "off"}>
          <Icon name="clock" size={13} />
          {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")} left
        </span>
      </Progress>

      <motion.div key={i} initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.025 } } }} className="mx-auto max-w-[340px] text-ink">
        <MatrixGrid cells={item.cells} />
      </motion.div>
      <p className="mb-3 mt-6 text-center text-sm text-ink-3">Choose the missing piece</p>
      <motion.div key={`o${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: 0.12 }} className="grid grid-cols-4 gap-2 text-ink sm:gap-3" role="radiogroup" aria-label={`Answers for puzzle ${i + 1}`}>
        {item.options.map((o, k) => {
          const on = state.answers[i] === k;
          return (
            <button key={k} role="radio" aria-checked={on} aria-label={`Option ${k + 1}`} onClick={() => pick(k)} className={`aspect-square rounded-[var(--r-md)] border p-1.5 transition-[border-color,background-color,transform,box-shadow] duration-200 active:scale-95 ${on ? "border-brand bg-brand-soft shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand)_18%,transparent)]" : "border-line bg-surface hover:border-ink-3"}`}>
              <MatrixCell cell={o} label={`Option ${k + 1}`} />
            </button>
          );
        })}
      </motion.div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button className="btn btn-soft" disabled={i === 0} onClick={() => setI(i - 1)}>Back</button>
          <button className="btn btn-soft" disabled={i === 23} onClick={() => setI(i + 1)}>Skip</button>
        </div>
        <button className="btn btn-primary" onClick={finish}>
          {answered === 24 ? "See my result" : `Finish (${answered}/24)`}
        </button>
      </div>
      <div className="mt-6 grid grid-cols-6 gap-1.5 sm:grid-cols-12" role="group" aria-label="Jump to puzzle">
        {form.map((_, k) => (
          <button key={k} onClick={() => setI(k)} aria-current={k === i ? "step" : undefined} aria-label={`Puzzle ${k + 1}${state.answers[k] !== -1 ? ", answered" : ""}`} className={`num h-11 rounded-full text-sm font-medium transition-colors ${k === i ? "bg-ink text-paper" : state.answers[k] !== -1 ? "bg-brand-soft text-brand-text" : "bg-sunken text-ink-3 hover:text-ink"}`}>
            {k + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
