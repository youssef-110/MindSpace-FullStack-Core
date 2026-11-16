import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { buildStroopTrials, scoreStroop } from "../../lib/tests/cognitive";
import { elapsed, useKeepVisible, useKeyDown, useLeave, useTimers } from "./hooks";
import { Calculating, Instructions, Notice, Paused, TaskFrame } from "./Shared";

// The one place fixed colours are used instead of tokens. The inks sit on a stage that is dark
// in both themes, and step down in luminance (yellow, green, red, blue: about 1.5x apart) so
// they stay distinguishable when hue alone is not enough. Order matches cognitive.js indexes.
const STAGE = "#0f0f14";
const COLORS = [
  { name: "Red", ink: "#ff5c4d", key: "D" },
  { name: "Blue", ink: "#3b6cf6", key: "F" },
  { name: "Green", ink: "#2fd27a", key: "J" },
  { name: "Yellow", ink: "#ffdf4a", key: "K" },
];
const PRACTICE = 6;
const SCORED = 40;
const FIXATION_MS = 500;
const TIMEOUT_MS = 3000;
const RUNNING = ["ready", "fix", "stim", "feedback"];

export default function Stroop({ test, onComplete }) {
  const [phase, setPhase] = useState("intro"); // intro | ready | fix | stim | feedback | break | paused | calc
  const [trial, setTrial] = useState(null);
  const [note, setNote] = useState(null); // { good, text }
  const [count, setCount] = useState({ practice: true, done: 0 });
  const run = useRef({ practice: true, list: [], i: 0, results: [], t0: 0, done: false });
  const buttons = useRef(null);
  const timers = useTimers();
  useKeepVisible(buttons, RUNNING.includes(phase));

  function begin(practice) {
    Object.assign(run.current, { practice, list: buildStroopTrials(practice ? PRACTICE : SCORED), i: 0 });
    setCount({ practice, done: 0 });
    getReady();
  }

  // Also the way back in after a pause: the interrupted word was never recorded, so it is
  // simply shown again.
  function getReady() {
    setNote(null);
    setPhase("ready");
    timers.after(1000, fixate);
  }

  function fixate() {
    const r = run.current;
    if (r.i >= r.list.length) return r.practice ? setPhase("break") : finish();
    setTrial(r.list[r.i]);
    setNote(null);
    setPhase("fix");
    // Flushed and stamped inside the animation frame callback that paints the word.
    timers.after(FIXATION_MS, () =>
      timers.frame(() => {
        flushSync(() => setPhase("stim"));
        r.t0 = performance.now();
        timers.after(TIMEOUT_MS, () => settle(null));
      })
    );
  }

  function settle(choice, e) {
    timers.clear();
    const r = run.current;
    const shown = r.list[r.i];
    const correct = choice === shown.ink;
    if (!r.practice) r.results.push({ congruent: shown.congruent, correct, rt: choice === null ? null : elapsed(e, r.t0) });
    r.i += 1;
    setCount({ practice: r.practice, done: r.practice ? 0 : r.results.length });
    if (correct && !r.practice) return fixate();
    const ink = COLORS[shown.ink].name.toLowerCase();
    setNote({ good: correct, text: correct ? "Correct" : choice === null ? `Too slow. The ink was ${ink}.` : `Not quite. The ink was ${ink}.` });
    setPhase("feedback");
    timers.after(r.practice ? (correct ? 700 : 1500) : 900, fixate);
  }

  function finish() {
    const r = run.current;
    setPhase("calc");
    timers.after(1400, () => {
      if (r.done) return;
      r.done = true;
      onComplete(scoreStroop(r.results));
    });
  }

  const respond = (choice, e) => phase === "stim" && settle(choice, e);

  useKeyDown((e) => {
    const k = e.key.toUpperCase();
    const choice = COLORS.findIndex((c, i) => c.key === k || String(i + 1) === k);
    if (choice >= 0) respond(choice, e);
  });
  useLeave(() => {
    if (!RUNNING.includes(phase)) return;
    timers.clear();
    setPhase("paused");
  });

  return (
    <TaskFrame title={test.name} label={phase === "intro" ? "" : count.practice ? "Practice" : `${count.done} of ${SCORED}`} value={count.done} total={SCORED}>
      {phase === "intro" && (
        <Instructions
          title="Name the ink, not the word"
          steps={["A colour word appears, printed in coloured ink. Ignore what the word says.", "Press the button for the colour of the ink. On a keyboard use D, F, J and K, or 1 to 4.", `Be quick, but stay accurate. ${PRACTICE} practice words, then ${SCORED} that count.`]}
          note="This task needs colour vision. If red, green, blue and yellow are hard to tell apart, the score will not mean much."
          onStart={() => begin(true)}
        />
      )}
      {phase === "break" && <Notice title="Practice done" text={`Now ${SCORED} words that count. There is no feedback this time unless you slip. Keep your fingers on the keys or your thumbs over the buttons.`} cta="Begin" onAction={() => begin(false)} />}
      {phase === "paused" && <Paused onResume={getReady} />}
      {phase === "calc" && <Calculating />}
      {RUNNING.includes(phase) && (
        <div ref={buttons} className="scroll-mb-28 scroll-mt-24">
          <div className="grid h-40 place-items-center rounded-[var(--r-xl)]" style={{ background: STAGE }}>
            {phase === "ready" && <p className="font-medium text-white/80">Get ready</p>}
            {phase === "fix" && <p className="text-4xl font-medium text-white/50" aria-hidden="true">+</p>}
            {/* No animation on the word: it must appear in a single frame. */}
            {phase === "stim" && <p className="text-6xl font-semibold" style={{ color: COLORS[trial.ink].ink }}>{COLORS[trial.word].name.toLowerCase()}</p>}
          </div>
          <p className={`mt-3 h-6 text-center text-[0.9375rem] font-medium ${note?.good ? "text-sage" : "text-ink"}`} aria-live="polite">{phase === "feedback" ? note.text : ""}</p>
          <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {COLORS.map((c, i) => (
              // pointerdown, not click: click waits for the release. Click is kept only for
              // keyboard activation (detail 0), so a slow release cannot answer the next word.
              <button key={c.name} type="button" className="btn btn-soft h-16 select-none justify-start gap-3 px-5 text-lg" onPointerDown={(e) => e.button === 0 && respond(i, e)} onClick={(e) => e.detail === 0 && respond(i, e)}>
                <span className="h-5 w-5 shrink-0 rounded-full ring-1 ring-ink/15" style={{ background: c.ink }} aria-hidden="true" />
                {c.name}
                <span className="ml-auto hidden text-sm font-medium text-ink-3 sm:inline" aria-hidden="true">{c.key}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </TaskFrame>
  );
}
