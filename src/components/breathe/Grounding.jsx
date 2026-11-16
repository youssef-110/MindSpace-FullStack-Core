import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "../ui";

const STEPS = [
  [5, "things you can see", "Look around slowly and name them."],
  [4, "things you can touch", "Your clothes, the chair, the floor under your feet."],
  [3, "things you can hear", "Near sounds, far sounds, even the hum of quiet."],
  [2, "things you can smell", "Or two smells you like, if nothing comes."],
  [1, "thing you can taste", "Or one kind thing you can say to yourself."],
];

// 5-4-3-2-1 as a tappable list: tap the highlighted step to move on, or any step to jump to it.
export default function Grounding() {
  const [step, setStep] = useState(0);
  const done = step >= STEPS.length;
  return (
    <section className="card p-5 sm:p-8" aria-labelledby="grounding-title">
      <h2 id="grounding-title" className="text-[2rem] sm:text-[2.5rem]">5-4-3-2-1 grounding</h2>
      <p className="mt-3 max-w-xl">For panic or spiralling thoughts: anchor yourself to your senses, one at a time.</p>

      <ol className="mt-6 grid gap-1.5">
        {STEPS.map(([n, title, hint], i) => {
          const active = i === step;
          const past = i < step;
          return (
            <li key={n}>
              <button
                type="button"
                aria-current={active ? "step" : undefined}
                aria-label={`${n} ${title}. ${hint}${past ? " Done." : active ? " Tap when you have them." : ""}`}
                onClick={() => setStep(active ? i + 1 : i)}
                className="relative flex min-h-[4.5rem] w-full items-center gap-4 rounded-[var(--r-md)] px-4 py-3 text-left"
              >
                {active && <motion.span layoutId="grounding-step" className="absolute inset-0 rounded-[var(--r-md)] bg-brand-soft" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                <span className={`display num relative w-9 shrink-0 text-center text-[2.5rem] transition-colors ${active ? "text-brand-text" : past ? "text-ink-3" : "text-ink"}`}>{n}</span>
                <span className={`relative flex-1 transition-opacity ${past ? "opacity-60" : ""}`}>
                  <span className="block font-semibold text-ink">{title}</span>
                  <span className="block text-sm text-ink-2">{hint}</span>
                </span>
                <span className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full ${active ? "bg-brand-fill text-brand-ink" : "text-ink-3"}`}>
                  {(active || past) && <Icon name={past ? "check" : "arrow"} size={18} />}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div aria-live="polite">
        {done && (
          <motion.div className="well mt-4 p-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h3 className="text-lg">You're here.</h3>
            <p className="mt-1.5 max-w-xl">Notice how your body feels now compared with a minute ago. Anchoring yourself is a skill, and you just practised it.</p>
            <button type="button" className="btn btn-soft mt-4" onClick={() => setStep(0)}>
              <Icon name="refresh" size={16} />
              Start again
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
