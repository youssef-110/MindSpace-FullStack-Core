import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { save } from "../../lib/storage";
import { Icon } from "../ui";
import Progress from "./Progress";
import QuestionCard from "./QuestionCard";

// One question at a time. Answers and the time spent on each item are saved as a draft on every change.
export default function QuestionFlow({ test, initial, onDone }) {
  const n = test.items.length;
  const [answers, setAnswers] = useState(() => initial?.answers ?? test.items.map(() => null));
  const [timesMs, setTimesMs] = useState(() => initial?.timesMs ?? test.items.map(() => null));
  const [i, setI] = useState(() => {
    const first = answers.findIndex((a) => a === null);
    return first === -1 ? n - 1 : first;
  });
  const [dir, setDir] = useState(1);
  const shownAt = useRef(0);
  const finished = useRef(false);

  useEffect(() => {
    shownAt.current = performance.now();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [i]);

  useEffect(() => {
    if (!finished.current) save(`draft:${test.id}`, { answers, timesMs });
  }, [answers, timesMs, test.id]);

  const go = useCallback((to, d) => {
    setDir(d);
    setI(to);
  }, []);

  const choose = useCallback(
    (value) => {
      if (finished.current) return;
      // Time adds up across visits, so a quick second click or a revision never looks like speeding.
      const now = performance.now();
      const spent = now - shownAt.current;
      shownAt.current = now;
      const next = answers.map((a, k) => (k === i ? value : a));
      const times = timesMs.map((t, k) => (k === i ? Math.round((t ?? 0) + spent) : t));
      setAnswers(next);
      setTimesMs(times);
      if (next.every((a) => a !== null)) {
        finished.current = true;
        return onDone(next, times);
      }
      setDir(1);
      // Absolute target, not cur + 1: a double-click or repeated key press must not skip the next item.
      setTimeout(() => setI(Math.min(i + 1, n - 1)), 160);
    },
    [answers, timesMs, i, n, onDone]
  );

  const canNext = answers[i] !== null && i < n - 1;
  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      const k = Number(e.key);
      if (e.key.trim().length === 1 && k >= 1 && k <= test.options.length) choose(test.options[k - 1].value);
      else if ((e.key === "Backspace" || e.key === "ArrowLeft") && i > 0) go(i - 1, -1);
      else if (e.key === "ArrowRight" && canNext) go(i + 1, 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose, go, i, canNext, test.options]);

  const done = answers.filter((a) => a !== null).length;
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="sr-only">{test.name}</h1>
      <Progress value={done} total={n} label={`${i + 1} of ${n}`} />
      {test.intro && <p className="mb-4 text-ink-3">{test.intro}</p>}

      <div className="min-h-[24rem]">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <QuestionCard key={i} text={test.items[i]} count={`Question ${i + 1} of ${n}`} options={test.options} value={answers[i]} dir={dir} onChoose={choose} />
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button className="btn btn-soft" disabled={i === 0} onClick={() => go(i - 1, -1)}>
          <Icon name="back" size={18} />
          Back
        </button>
        <p className="hidden text-center text-sm text-ink-3 md:block">
          Press 1 to {Math.min(9, test.options.length)} to answer, Backspace to go back
        </p>
        {canNext ? (
          <button className="btn btn-soft" onClick={() => go(i + 1, 1)}>
            Next
            <Icon name="chevron" size={18} />
          </button>
        ) : (
          <span className="w-24" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
