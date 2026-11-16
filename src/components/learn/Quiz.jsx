import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { saveQuizScore } from "../../lib/storage";
import { rng } from "../../lib/tests/matrix";
import { EASE, Icon, Reveal, Ring } from "../ui";

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

const enter = { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.45, ease: EASE } };

// One question at a time. `step === total` is the score summary.
export default function Quiz({ lesson }) {
  const total = lesson.quiz.length;
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const orders = useMemo(() => lesson.quiz.map((q, i) => order(q[1].length, (i + 1) * 9973 + lesson.id.length * 31)), [lesson]);
  const correct = lesson.quiz.filter((q, i) => answers[i] === q[2]).length;
  const headRef = useRef(null);
  const moved = useRef(false);

  // Keyboard and screen-reader users land on the new question (or the score) after moving on.
  useEffect(() => {
    if (moved.current) headRef.current?.focus({ preventScroll: true });
  }, [step]);

  function go(to) {
    moved.current = true;
    setStep(to);
  }

  function choose(oi) {
    if (answers[step] !== undefined) return;
    const next = { ...answers, [step]: oi };
    setAnswers(next);
    if (Object.keys(next).length === total) {
      saveQuizScore(lesson.id, lesson.quiz.filter((q, i) => next[i] === q[2]).length, total);
    }
  }

  const finished = step >= total;
  const [question, options, right, why] = finished ? [] : lesson.quiz[step];
  const picked = answers[step];
  const revealed = picked !== undefined;
  const ok = picked === right;

  return (
    <section className="mt-16 md:mt-20" aria-labelledby="quiz">
      <Reveal>
        <p className="eyebrow mb-2">A short check, {total} questions</p>
        <h2 id="quiz" className="text-[2rem] sm:text-4xl">Check your understanding</h2>
      </Reveal>

      <Reveal className="card mt-6 overflow-hidden p-5 sm:p-8" delay={0.05}>
        <div className="mb-6 flex items-center gap-4">
          <div className="flex flex-1 gap-1.5" aria-hidden="true">
            {lesson.quiz.map((q, i) => {
              const tone = answers[i] === undefined ? (i === step ? "bg-brand" : "bg-sunken") : answers[i] === q[2] ? "bg-sage" : "bg-rose";
              return <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${tone}`} />;
            })}
          </div>
          <p className="num eyebrow">{finished ? "Done" : `Question ${step + 1} of ${total}`}</p>
        </div>

        {finished ? (
          <motion.div key="score" {...enter} className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <Ring value={correct} max={total} size={120} color={correct === total ? "var(--sage)" : "var(--brand)"} label={`${correct} of ${total} correct`}>
              <span className="display num text-[2.25rem]">
                {correct}
                <span className="font-sans text-base text-ink-3">/{total}</span>
              </span>
            </Ring>
            <div>
              <h3 ref={headRef} tabIndex={-1} className="text-xl outline-none">You got {correct} of {total}.</h3>
              <p className="mt-2 text-ink-2">
                {correct === total ? "Every answer right. Your score is saved." : "Your best score is saved. You can take the check again whenever you like."}
              </p>
              <button
                type="button"
                className="btn btn-ghost btn-sm mt-4 min-h-11"
                onClick={() => {
                  setAnswers({});
                  go(0);
                }}
              >
                <Icon name="refresh" size={16} />
                Try again
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key={step} {...enter}>
            <h3 ref={headRef} tabIndex={-1} className="text-xl outline-none sm:text-[1.375rem]">{question}</h3>
            <div className="mt-5 grid gap-2.5" role="group" aria-label="Answers">
              {orders[step].map((oi) => {
                const isRight = revealed && oi === right;
                const isWrong = revealed && oi === picked && !ok;
                const tone = isRight
                  ? "border-sage bg-sage-soft text-ink"
                  : isWrong
                    ? "border-rose bg-rose-soft text-ink"
                    : revealed
                      ? "border-line text-ink-3"
                      : "border-line bg-surface text-ink hover:border-ink-3 hover:bg-sunken";
                return (
                  <motion.button
                    key={oi}
                    type="button"
                    onClick={() => choose(oi)}
                    // aria-disabled, not disabled: the chosen answer keeps keyboard focus.
                    aria-disabled={revealed}
                    animate={isWrong ? { x: [0, -6, 6, -3, 0] } : isRight ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 0.35 }}
                    className={`flex min-h-[52px] items-center gap-3 rounded-[var(--r-md)] border-[1.5px] px-4 py-3 text-left transition-colors aria-disabled:cursor-default ${tone}`}
                  >
                    <span className="flex-1">{options[oi]}</span>
                    {isRight && <Icon name="check" size={20} className="text-sage" />}
                    {isWrong && <Icon name="close" size={20} className="text-rose" />}
                    {(isRight || isWrong) && <span className="sr-only">{isRight ? "Correct answer" : "Your answer, not correct"}</span>}
                  </motion.button>
                );
              })}
            </div>

            <div aria-live="polite">
              {revealed && (
                <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: EASE }} className={`mt-4 rounded-[var(--r-md)] p-4 text-[0.9375rem] text-ink-2 ${ok ? "bg-sage-soft" : "bg-rose-soft"}`}>
                  <strong className={ok ? "text-sage" : "text-rose"}>{ok ? "Correct. " : "Not quite. "}</strong>
                  {why}
                </motion.p>
              )}
            </div>

            {revealed && (
              <div className="mt-5 flex justify-end">
                <button type="button" className="btn btn-primary" onClick={() => go(step + 1)}>
                  {step + 1 < total ? "Next question" : "See your score"}
                  <Icon name="arrow" size={18} />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </Reveal>
    </section>
  );
}
