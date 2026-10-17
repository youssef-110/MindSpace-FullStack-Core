import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const techniques = [
  { id: "calm", name: "Calming breath", desc: "Longer exhales than inhales nudge the body toward rest. Good for winding down.", phases: [["Breathe in", 4, 1], ["Breathe out slowly", 6, 0.55]] },
  { id: "box", name: "Box breathing", desc: "Four equal sides. Steady and easy to remember under pressure.", phases: [["Breathe in", 4, 1], ["Hold", 4, 1], ["Breathe out", 4, 0.55], ["Hold", 4, 0.55]] },
  { id: "478", name: "4-7-8 breathing", desc: "A long hold and a long exhale. Many people use it before sleep.", phases: [["Breathe in", 4, 1], ["Hold", 7, 1], ["Breathe out", 8, 0.55]] },
];

const grounding = [
  [5, "things you can see", "Look around slowly and name them."],
  [4, "things you can touch", "Your clothes, the chair, the floor under your feet."],
  [3, "things you can hear", "Near sounds, far sounds, even the hum of quiet."],
  [2, "things you can smell", "Or two smells you like, if nothing comes."],
  [1, "thing you can taste", "Or one kind thing you can say to yourself."],
];

function Session({ technique, onExit }) {
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(technique.phases[0][1]);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    // One interval drives the session; locals avoid cascading state updates.
    let p = 0;
    let c = technique.phases[0][1];
    const timer = setInterval(() => {
      c -= 1;
      if (c <= 0) {
        p = (p + 1) % technique.phases.length;
        if (p === 0) setCycles((n) => n + 1);
        c = technique.phases[p][1];
        setPhase(p);
      }
      setCount(c);
    }, 1000);
    return () => clearInterval(timer);
  }, [technique]);

  const [label, secs, scale] = technique.phases[phase];
  return (
    <div className="flex flex-col items-center py-6">
      <div className="relative grid place-items-center" style={{ width: "min(20rem, 80vw)", height: "min(20rem, 80vw)" }}>
        <motion.div
          className="absolute rounded-full bg-brand/15"
          style={{ width: "100%", height: "100%" }}
          animate={{ scale }}
          transition={{ duration: secs, ease: "easeInOut" }}
        />
        <motion.div
          className="grid place-items-center rounded-full bg-brand text-brand-ink"
          style={{ width: "72%", height: "72%" }}
          animate={{ scale }}
          transition={{ duration: secs, ease: "easeInOut" }}
        >
          <div className="text-center" aria-live="polite">
            <div className="text-xl font-bold">{label}</div>
            <div className="font-display text-5xl font-semibold tabular-nums">{count || secs}</div>
          </div>
        </motion.div>
      </div>
      <p className="mt-6 mb-5 text-ink-2">{cycles > 0 ? `${cycles} cycle${cycles > 1 ? "s" : ""} complete` : "Follow the circle with your breath"}</p>
      <button onClick={onExit} className="btn btn-quiet">End session</button>
    </div>
  );
}

function Grounding({ onExit }) {
  const [step, setStep] = useState(0);
  const done = step >= grounding.length;
  return (
    <div className="panel mx-auto max-w-md p-8 text-center">
      {!done ? (
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="font-display text-7xl font-semibold text-brand">{grounding[step][0]}</div>
            <h2 className="mt-2 text-2xl font-semibold">{grounding[step][1]}</h2>
            <p className="mt-2 mb-8 text-ink-2">{grounding[step][2]}</p>
            <button onClick={() => setStep(step + 1)} className="btn btn-primary w-full">{step === grounding.length - 1 ? "Done" : "Next"}</button>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold">You're here.</h2>
          <p className="mt-2 mb-8 text-ink-2">Notice how your body feels now compared with a minute ago. Anchoring yourself is a skill, and you just practised it.</p>
          <button onClick={onExit} className="btn btn-primary w-full">Finish</button>
        </div>
      )}
      {!done && <button onClick={onExit} className="mt-4 text-sm font-bold text-ink-2 hover:text-ink">Exit</button>}
    </div>
  );
}

export default function Breathe() {
  const [session, setSession] = useState(null); // technique | "grounding" | null
  return (
    <div className="mx-auto max-w-4xl py-10">
      <h1 className="text-4xl sm:text-5xl font-semibold">Breathe and ground</h1>
      <p className="mt-3 max-w-xl text-lg text-ink-2">Two minutes of slow breathing can calm your body's stress response. Pick one and follow along.</p>

      <div className="mt-8">
        {session === null && (
          <div className="grid gap-4 md:grid-cols-3">
            {techniques.map((t) => (
              <button key={t.id} onClick={() => setSession(t)} className="panel p-5 text-left transition-transform hover:-translate-y-0.5">
                <h2 className="text-xl font-semibold">{t.name}</h2>
                <p className="mt-1.5 text-[0.95rem] text-ink-2">{t.desc}</p>
                <span className="tag mt-4">{t.phases.map((p) => p[1]).join("-")} seconds</span>
              </button>
            ))}
            <button onClick={() => setSession("grounding")} className="panel p-5 text-left md:col-span-3 transition-transform hover:-translate-y-0.5">
              <h2 className="text-xl font-semibold">5-4-3-2-1 grounding</h2>
              <p className="mt-1.5 text-[0.95rem] text-ink-2">For panic or spiralling thoughts: anchor yourself to your senses, one at a time.</p>
            </button>
          </div>
        )}
        {session && session !== "grounding" && <Session technique={session} onExit={() => setSession(null)} />}
        {session === "grounding" && <Grounding onExit={() => setSession(null)} />}
      </div>
    </div>
  );
}
