import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { motion } from "framer-motion";
import { EASE } from "../ui";
import { ANTICIPATION_MS, isCleanRt, scoreReactionTime } from "../../lib/tests/cognitive";
import { elapsed, useKeepVisible, useKeyDown, useLeave, useTimers } from "./hooks";
import { Calculating, Instructions, Notice, Paused, TaskFrame } from "./Shared";

const PRACTICE = 2;
const SCORED = 8;
const MAX_ROUNDS = 24; // scored rounds including false starts and misses, so a run always ends
const MIN_CLEAN = 3;
const TIMEOUT_MS = 2000;
const RUNNING = ["ready", "wait", "go", "feedback"];
const fresh = () => ({ trials: [], practice: PRACTICE, t0: 0, done: false });

const CAPTION = {
  ready: "Get ready",
  counts: "Practice done. The next eight count.",
  wait: "Wait for the disc to fill",
  go: "Now",
  early: "Too soon. Wait for the disc to fill.",
  slow: "Missed that one. It will come round again.",
  ok: "Nice.",
};

export default function ReactionTime({ test, onComplete }) {
  const [phase, setPhase] = useState("intro"); // intro | ready | wait | go | feedback | paused | failed | calc
  const [note, setNote] = useState(null); // { kind: "ok" | "early" | "slow", rt }
  const [count, setCount] = useState({ practice: PRACTICE, clean: 0 });
  const run = useRef(fresh());
  const stage = useRef(null);
  const timers = useTimers();
  useKeepVisible(stage, phase === "intro");

  function getReady() {
    setPhase("ready");
    timers.after(1000, arm);
  }

  // Foreperiod of 1.5 to 4 s, then the disc fills. The state change is flushed inside the
  // animation frame callback and stamped there, so the timestamp belongs to the frame that
  // paints the stimulus.
  function arm() {
    setPhase("wait");
    timers.after(1500 + Math.random() * 2500, () =>
      timers.frame(() => {
        flushSync(() => setPhase("go"));
        run.current.t0 = performance.now();
        timers.after(TIMEOUT_MS, () => settle({ missed: true }));
      })
    );
  }

  function settle(trial) {
    timers.clear();
    const r = run.current;
    const clean = isCleanRt(trial);
    const early = trial.falseStart || trial.rt < ANTICIPATION_MS;
    const lastPractice = r.practice === 1 && clean;
    if (r.practice > 0) r.practice -= clean ? 1 : 0;
    else r.trials.push(trial);
    setNote({ kind: clean ? "ok" : early ? "early" : "slow", rt: trial.rt });
    setCount({ practice: r.practice, clean: r.trials.filter(isCleanRt).length });
    setPhase("feedback");
    timers.after(clean ? 1100 : 1600, () => next(lastPractice));
  }

  // Also the way back in after a pause, so a run interrupted on its last round still ends.
  function next(beat = true) {
    const r = run.current;
    const clean = r.trials.filter(isCleanRt).length;
    if (r.practice > 0 || (clean < SCORED && r.trials.length < MAX_ROUNDS)) return beat ? getReady() : arm();
    if (clean < MIN_CLEAN) return setPhase("failed");
    setPhase("calc");
    timers.after(1400, () => {
      if (r.done) return;
      r.done = true;
      onComplete(scoreReactionTime(r.trials));
    });
  }

  function respond(e) {
    if (e.button > 0) return; // primary button or touch only
    if (phase === "wait") settle({ falseStart: true });
    else if (phase === "go") settle({ rt: elapsed(e, run.current.t0) });
  }

  useKeyDown((e) => {
    if (!RUNNING.includes(phase) || (e.key !== " " && e.key !== "Enter")) return;
    e.preventDefault(); // Space would scroll the page
    respond(e);
  });
  useLeave(() => {
    if (!RUNNING.includes(phase)) return;
    timers.clear();
    setPhase("paused");
  });

  const practising = count.practice > 0;
  const kind = phase === "feedback" ? note.kind : phase === "ready" && !practising && count.clean === 0 ? "counts" : phase;
  return (
    <TaskFrame title={test.name} label={phase === "intro" ? "" : practising ? "Practice" : `${count.clean} of ${SCORED}`} value={count.clean} total={SCORED}>
      {phase === "intro" && (
        <Instructions
          title="Tap the moment the disc fills"
          steps={["An empty ring appears. Wait.", "After a pause of a few seconds it fills with colour. Tap anywhere on the pad, or press Space, as fast as you can.", `Tapping early is a false start and the round repeats. ${PRACTICE} practice rounds, then ${SCORED} that count.`]}
          note="Use the same device and the same hand each time you repeat this."
          onStart={getReady}
        />
      )}
      {phase === "paused" && <Paused onResume={() => next()} />}
      {phase === "failed" && (
        <Notice title="Not enough clean rounds" text="Too many rounds were early or missed to give an honest score. Nothing was saved." cta="Try again" onAction={() => { run.current = fresh(); setCount({ practice: PRACTICE, clean: 0 }); getReady(); }} />
      )}
      {phase === "calc" && <Calculating />}
      {RUNNING.includes(phase) && (
        <div ref={stage} role="button" tabIndex={0} aria-label="Reaction pad. Tap when the ring fills." onPointerDown={respond} className="grid h-[min(52svh,24rem)] scroll-mb-28 scroll-mt-24 cursor-pointer touch-none select-none place-items-center rounded-[var(--r-xl)] bg-sunken">
          <div className="grid justify-items-center gap-5">
            <div className="grid h-36 w-36 place-items-center">
              {phase === "feedback" && note.kind === "ok" ? (
                <motion.p key={count.clean + count.practice} className="num text-6xl font-semibold text-ink" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2, ease: EASE }}>
                  {Math.round(note.rt)}
                  <span className="ml-1 text-lg font-medium text-ink-3">ms</span>
                </motion.p>
              ) : (
                // No transition here: the fill must arrive in a single frame.
                <div className={`h-36 w-36 rounded-full ${phase === "go" ? "bg-brand-fill" : "border-2 border-dashed border-ink-3/50"}`} />
              )}
            </div>
            <p className="h-6 px-4 text-center text-[0.9375rem] font-medium text-ink-2" aria-live="polite">{CAPTION[kind]}</p>
          </div>
        </div>
      )}
    </TaskFrame>
  );
}
