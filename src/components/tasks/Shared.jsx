import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "../ui";

// Title, a slim progress bar and room for the task. The bottom padding lets the page scroll
// the controls above the floating tab capsule on phones.
export function TaskFrame({ title, label, value, total, children }) {
  const pct = total ? Math.min(1, Math.max(0, value / total)) : 0;
  return (
    <div className="mx-auto max-w-xl pb-28 md:pb-10">
      <div className="mb-2 flex items-center justify-between gap-4 text-sm text-ink-3">
        <span className="truncate">{title}</span>
        <span className="num shrink-0">{label}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-label="Progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={value}>
        <div className="h-full rounded-full bg-brand transition-transform duration-300 ease-out" style={{ transform: `translateX(${(pct - 1) * 100}%)` }} />
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Card({ children, ...rest }) {
  const reduce = useReducedMotion();
  return (
    <motion.section className="card p-6 sm:p-8" initial={{ opacity: 0, y: reduce ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} {...rest}>
      {children}
    </motion.section>
  );
}

// The instruction card shown before practice.
export function Instructions({ title, steps, note, cta = "Start practice", onStart }) {
  return (
    <Card>
      <p className="eyebrow mb-2">How it works</p>
      <h2 className="text-[1.75rem] sm:text-[2rem]">{title}</h2>
      <ol className="mt-5 grid gap-3">
        {steps.map((step, i) => (
          <li key={step} className="flex gap-3">
            <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sunken text-sm font-semibold text-ink">{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      {note && <p className="mt-5 text-sm text-ink-3">{note}</p>}
      <button type="button" autoFocus className="btn btn-primary btn-lg mt-7 w-full sm:w-auto" onClick={onStart}>
        {cta}
      </button>
    </Card>
  );
}

// A short message with one action: paused, practice finished, could not score.
export function Notice({ title, text, cta, onAction }) {
  return (
    <Card role="status">
      <h2 className="text-[1.75rem]">{title}</h2>
      <p className="mt-3 max-w-prose">{text}</p>
      <button type="button" autoFocus className="btn btn-primary mt-6 w-full sm:w-auto" onClick={onAction}>
        {cta}
      </button>
    </Card>
  );
}

export function Paused({ onResume }) {
  return <Notice title="Paused" text="You looked away, so the round in progress was thrown out. Nothing else was lost." cta="Resume" onAction={onResume} />;
}

// The short beat between the last trial and the result page.
export function Calculating() {
  const reduce = useReducedMotion();
  return (
    <Card role="status">
      <div className="flex items-center gap-4 py-6">
        <span className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2.5 w-2.5 rounded-full bg-brand"
              animate={reduce ? undefined : { opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
            />
          ))}
        </span>
        <p className="font-medium text-ink">Working out your result</p>
      </div>
    </Card>
  );
}
