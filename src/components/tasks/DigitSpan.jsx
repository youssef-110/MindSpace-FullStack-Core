import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { EASE, Icon } from "../ui";
import { SPAN_CAP, SPAN_START, generateSequence, nextSpanLength, scoreDigitSpan } from "../../lib/tests/cognitive";
import { useKeepVisible, useKeyDown, useLeave, useTimers } from "./hooks";
import { Calculating, Instructions, Paused, TaskFrame } from "./Shared";

const PRACTICE_LENGTH = 2;
const ON_MS = 700; // each digit is visible for 0.7 s, then 0.3 s of blank: one digit a second
const STEP_MS = 1000;
const RUNNING = ["ready", "show", "recall", "feedback"];
const PAD = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function DigitSpan({ test, onComplete }) {
  const [phase, setPhase] = useState("intro"); // intro | ready | show | recall | feedback | paused | calc
  const [seq, setSeq] = useState([]);
  const [shown, setShown] = useState(-1); // index of the digit on screen, -1 for blank
  const [input, setInput] = useState([]);
  const [correct, setCorrect] = useState(false);
  const [rung, setRung] = useState({ practice: true, length: PRACTICE_LENGTH, attempt: 1 });
  const run = useRef({ attempts: [], practice: true, done: false });
  const pad = useRef(null);
  const timers = useTimers();
  useKeepVisible(pad, phase === "intro");

  function present(length) {
    const digits = generateSequence(length);
    setSeq(digits);
    setInput([]);
    setShown(-1);
    setPhase("ready");
    timers.after(1200, () => {
      setPhase("show");
      digits.forEach((_, i) => {
        timers.after(400 + i * STEP_MS, () => setShown(i));
        timers.after(400 + i * STEP_MS + ON_MS, () => setShown(-1));
      });
      timers.after(400 + digits.length * STEP_MS, () => setPhase("recall"));
    });
  }

  // Also the way back in after a pause: an interrupted sequence is replaced by a new one of
  // the same length.
  function next() {
    const r = run.current;
    if (r.practice) {
      setRung({ practice: true, length: PRACTICE_LENGTH, attempt: 1 });
      return present(PRACTICE_LENGTH);
    }
    const length = nextSpanLength(r.attempts);
    if (length === null) {
      setPhase("calc");
      return timers.after(1400, () => {
        if (r.done) return;
        r.done = true;
        onComplete(scoreDigitSpan(r.attempts));
      });
    }
    setRung({ practice: false, length, attempt: r.attempts.filter((a) => a.length === length).length + 1 });
    present(length);
  }

  function submit() {
    if (phase !== "recall" || !input.length) return;
    const right = input.length === seq.length && input.every((d, i) => d === seq[i]);
    const r = run.current;
    if (r.practice) r.practice = false;
    else r.attempts.push({ length: seq.length, correct: right });
    setCorrect(right);
    setPhase("feedback");
    timers.after(right ? 1100 : 2200, next);
  }
  const type = (d) => phase === "recall" && setInput((cur) => (cur.length < seq.length ? [...cur, d] : cur));
  const erase = () => phase === "recall" && setInput((cur) => cur.slice(0, -1));

  useKeyDown((e) => {
    if (phase !== "recall") return;
    if (/^\d$/.test(e.key)) type(Number(e.key));
    else if (e.key === "Backspace") erase();
    // Enter on a focused button already activates that button.
    else if (e.key === "Enter" && !e.target.closest?.("button")) submit();
  });
  useLeave(() => {
    if (!RUNNING.includes(phase)) return;
    timers.clear();
    setPhase("paused");
  });

  const recalling = phase === "recall";
  const key = "btn btn-soft num h-[3.25rem] px-0 text-xl";
  const noFocus = (e) => e.preventDefault(); // a mouse click must not leave focus on a key, or Enter would retype it
  return (
    <TaskFrame title={test.name} label={phase === "intro" ? "" : rung.practice ? "Practice" : `${rung.length} digits, try ${rung.attempt} of 2`} value={rung.practice ? 0 : rung.length - SPAN_START + (rung.attempt - 1) / 2} total={SPAN_CAP - SPAN_START + 1}>
      {phase === "intro" && (
        <Instructions
          title="Watch the digits, then type them back"
          steps={["Digits appear one at a time, about one a second. Just watch.", "When the keypad lights up, enter them in the same order and press the tick. A keyboard works too.", "It starts at three digits and grows by one. You get two tries at each length, and it ends when you miss both."]}
          note="No writing them down, and no saying them aloud to someone else. One short practice first."
          onStart={next}
        />
      )}
      {phase === "paused" && <Paused onResume={next} />}
      {phase === "calc" && <Calculating />}
      {RUNNING.includes(phase) && (
        <div ref={pad} className="scroll-mb-28 scroll-mt-24">
          <div className="grid h-36 place-items-center rounded-[var(--r-xl)] bg-sunken px-3 text-center" aria-live={phase === "show" ? "off" : "polite"}>
            {phase === "ready" && <p className="font-medium text-ink-2">{rung.practice ? "Practice: " : ""}{seq.length} digits. Watch closely.</p>}
            {/* No animation on the digit itself: it appears and goes in a single frame. */}
            {phase === "show" && <p className="num text-[5.5rem] font-semibold leading-none text-ink">{shown >= 0 ? seq[shown] : ""}</p>}
            {recalling && (
              <div className="flex w-full max-w-sm justify-center gap-1" aria-label={`Entered ${input.join(" ") || "nothing yet"}`}>
                {seq.map((_, i) => (
                  <span key={i} className={`num grid h-11 min-w-0 max-w-9 flex-1 place-items-center rounded-[10px] text-xl font-semibold text-ink ${i === input.length ? "bg-brand-soft" : "bg-surface"}`}>{input[i] ?? ""}</span>
                ))}
              </div>
            )}
            {phase === "feedback" && (
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, ease: EASE }}>
                <p className={`flex items-center justify-center gap-2 text-lg font-semibold ${correct ? "text-sage" : "text-ink"}`}>{correct && <Icon name="check" />}{correct ? "Correct" : "Not quite"}</p>
                {!correct && <p className="num mt-2 text-ink-2">It was {seq.join(" ")}</p>}
              </motion.div>
            )}
          </div>
          <div className="mx-auto mt-4 grid max-w-xs grid-cols-3 gap-2">
            {PAD.map((d) => (
              <button key={d} type="button" className={key} disabled={!recalling} onMouseDown={noFocus} onClick={() => type(d)}>{d}</button>
            ))}
            <button type="button" className={key} disabled={!recalling || !input.length} onMouseDown={noFocus} onClick={erase} aria-label="Delete the last digit"><Icon name="back" /></button>
            <button type="button" className={key} disabled={!recalling} onMouseDown={noFocus} onClick={() => type(0)}>0</button>
            <button type="button" className="btn btn-primary h-[3.25rem] px-0" disabled={!recalling || !input.length} onMouseDown={noFocus} onClick={submit} aria-label="Done, check my answer"><Icon name="check" /></button>
          </div>
        </div>
      )}
    </TaskFrame>
  );
}
