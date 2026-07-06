import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const techniques = [
  {
    id: "calm",
    name: "Calming breath",
    icon: "🌊",
    desc: "Long exhales activate the body's rest response. Best for winding down.",
    phases: [
      { label: "Breathe in", secs: 4, scale: 1 },
      { label: "Breathe out slowly", secs: 6, scale: 0.55 },
    ],
  },
  {
    id: "box",
    name: "Box breathing",
    icon: "📦",
    desc: "Used by Navy SEALs to stay calm under pressure. Four equal sides.",
    phases: [
      { label: "Breathe in", secs: 4, scale: 1 },
      { label: "Hold", secs: 4, scale: 1 },
      { label: "Breathe out", secs: 4, scale: 0.55 },
      { label: "Hold", secs: 4, scale: 0.55 },
    ],
  },
  {
    id: "478",
    name: "4-7-8 breathing",
    icon: "🌙",
    desc: "Dr. Weil's relaxing breath — great before sleep or during spiraling thoughts.",
    phases: [
      { label: "Breathe in", secs: 4, scale: 1 },
      { label: "Hold", secs: 7, scale: 1 },
      { label: "Breathe out", secs: 8, scale: 0.55 },
    ],
  },
];

const groundingSteps = [
  { n: 5, sense: "things you can SEE", icon: "👀", hint: "Look around slowly. Name them out loud or in your head." },
  { n: 4, sense: "things you can TOUCH", icon: "✋", hint: "The texture of your clothes, the chair beneath you…" },
  { n: 3, sense: "things you can HEAR", icon: "👂", hint: "Near sounds, far sounds, even the hum of silence." },
  { n: 2, sense: "things you can SMELL", icon: "👃", hint: "Or two smells you like, if you can't smell anything now." },
  { n: 1, sense: "thing you can TASTE", icon: "👅", hint: "Or one kind thing you can say about yourself." },
];

function BreathingSession({ technique, onExit }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [count, setCount] = useState(technique.phases[0].secs);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    // Drive the whole session from one interval; local vars avoid
    // cascading setState-in-effect renders.
    let pIdx = 0;
    let c = technique.phases[0].secs;
    const timer = setInterval(() => {
      c -= 1;
      if (c <= 0) {
        pIdx = (pIdx + 1) % technique.phases.length;
        if (pIdx === 0) setCycles((cy) => cy + 1);
        c = technique.phases[pIdx].secs;
        setPhaseIdx(pIdx);
      }
      setCount(c);
    }, 1000);
    return () => clearInterval(timer);
  }, [technique]);

  const phase = technique.phases[phaseIdx];

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center h-[22rem] w-[22rem]">
        {/* Ripple rings */}
        {[1.35, 1.2].map((r, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-teal-300/40 dark:border-teal-500/20"
            animate={{ scale: phase.scale * r }}
            transition={{ duration: phase.secs, ease: "easeInOut" }}
            style={{ width: "16rem", height: "16rem" }}
          />
        ))}
        <motion.div
          className="rounded-full bg-gradient-to-br from-teal-300 via-cyan-400 to-indigo-400 dark:from-teal-500 dark:via-cyan-600 dark:to-indigo-600 shadow-2xl shadow-teal-400/40 flex items-center justify-center"
          animate={{ scale: phase.scale }}
          transition={{ duration: phase.secs, ease: "easeInOut" }}
          style={{ width: "16rem", height: "16rem" }}
        >
          <div className="text-center text-white select-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={phase.label + phaseIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-xl font-extrabold drop-shadow"
              >
                {phase.label}
              </motion.div>
            </AnimatePresence>
            <div className="text-5xl font-black mt-1 drop-shadow">{count || phase.secs}</div>
          </div>
        </motion.div>
      </div>

      <div className="text-sm font-bold text-zinc-400 mt-2 mb-6">
        {cycles > 0 ? `${cycles} cycle${cycles > 1 ? "s" : ""} complete 🌱` : "Follow the circle with your breath"}
      </div>
      <button onClick={onExit} className="btn-ghost px-8 py-3 text-zinc-700 dark:text-zinc-200">End session</button>
    </div>
  );
}

function Grounding({ onExit }) {
  const [step, setStep] = useState(0);
  const done = step >= groundingSteps.length;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card max-w-md mx-auto p-10 text-center">
      {!done ? (
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
            <div className="text-5xl mb-4 animate-float">{groundingSteps[step].icon}</div>
            <div className="font-display text-7xl font-semibold text-teal-500 mb-2">{groundingSteps[step].n}</div>
            <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white mb-3">{groundingSteps[step].sense}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">{groundingSteps[step].hint}</p>
            <button onClick={() => setStep(step + 1)} className="btn-primary px-10 py-3.5 w-full">
              {step === groundingSteps.length - 1 ? "Done" : "Next"}
            </button>
          </motion.div>
        </AnimatePresence>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="text-5xl mb-4">🌿</div>
          <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-3">You're here.</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
            Notice how your body feels now compared to a minute ago. You anchored yourself — that's a skill, and you just practiced it.
          </p>
          <button onClick={onExit} className="btn-primary px-10 py-3.5 w-full">Finish</button>
        </motion.div>
      )}
      <button onClick={onExit} className="text-xs font-bold text-zinc-400 hover:text-zinc-600 mt-4 cursor-pointer">Exit</button>
    </motion.div>
  );
}

export default function Breathe() {
  const [session, setSession] = useState(null); // technique object | "grounding" | null

  return (
    <div className="max-w-4xl mx-auto relative">
      <div className="aurora w-[26rem] h-[26rem] bg-cyan-200/60 dark:bg-cyan-700/20 -top-20 left-1/4" />

      <header className="text-center mb-12 relative">
        <h1 className="font-display text-5xl font-semibold text-zinc-900 dark:text-white mb-3">Breathe & ground</h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          Your breath is a remote control for your nervous system. Two minutes here can genuinely shift how you feel.
        </p>
      </header>

      <AnimatePresence mode="wait">
        {session === null && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {techniques.map((t, i) => (
                <motion.button
                  key={t.id}
                  onClick={() => setSession(t)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="card card-hover p-7 text-left cursor-pointer"
                >
                  <div className="text-3xl mb-3">{t.icon}</div>
                  <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white mb-1.5">{t.name}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">{t.desc}</p>
                  <span className="text-xs font-black uppercase tracking-widest text-teal-600 dark:text-teal-400">
                    {t.phases.map((p) => p.secs).join(" · ")}s
                  </span>
                </motion.button>
              ))}
            </div>

            <motion.button
              onClick={() => setSession("grounding")}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="card card-hover w-full p-7 text-left cursor-pointer flex items-center gap-5"
            >
              <div className="text-4xl">🧭</div>
              <div>
                <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">5-4-3-2-1 Grounding</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  For panic, dissociation, or spiraling thoughts — anchor to your senses, one at a time.
                </p>
              </div>
            </motion.button>
          </motion.div>
        )}

        {session && session !== "grounding" && (
          <motion.div key="breath" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BreathingSession technique={session} onExit={() => setSession(null)} />
          </motion.div>
        )}

        {session === "grounding" && (
          <motion.div key="ground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Grounding onExit={() => setSession(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
