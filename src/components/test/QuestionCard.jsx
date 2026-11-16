import { useEffect, useId, useRef } from "react";
import { motion, useIsPresent } from "framer-motion";
import { EASE, Icon } from "../ui";

const slide = {
  enter: (dir) => ({ opacity: 0, x: dir * 36 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.34, ease: EASE } },
  exit: (dir) => ({ opacity: 0, x: dir * -36, transition: { duration: 0.14, ease: "easeIn" } }),
};

// One question with its answers as a radio group. Slides in from the side it was reached from.
export default function QuestionCard({ text, count, options, value, dir, onChoose }) {
  const present = useIsPresent();
  const group = useRef(null);
  const id = useId();
  const long = text.length > 110;

  // Move focus with the question so keyboard and screen-reader users land on the new group.
  useEffect(() => {
    group.current?.querySelector('[tabindex="0"]')?.focus({ preventScroll: true });
  }, []);

  const onKeyDown = (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const radios = [...group.current.querySelectorAll('[role="radio"]')];
    const at = radios.indexOf(document.activeElement);
    radios[(at + (e.key === "ArrowDown" ? 1 : -1) + radios.length) % radios.length].focus();
  };

  const anyChecked = options.some((o) => o.value === value);
  return (
    // An exiting copy is inert, so its stale buttons cannot be clicked or focused.
    <motion.div custom={dir} variants={slide} initial="enter" animate="center" exit="exit" inert={!present}>
      <h2 id={`${id}q`} className={long ? "font-sans text-[1.375rem] font-semibold leading-snug tracking-[-0.02em] sm:text-2xl" : "text-[1.75rem] leading-[1.12] sm:text-[2.25rem]"}>
        {text}
      </h2>
      <p id={`${id}c`} className="sr-only">{count}</p>
      <div ref={group} role="radiogroup" aria-labelledby={`${id}q`} aria-describedby={`${id}c`} onKeyDown={onKeyDown} className="mt-7 grid gap-2.5">
        {options.map((o, k) => {
          const on = o.value === value;
          return (
            <button
              key={o.label}
              role="radio"
              aria-checked={on}
              tabIndex={on || (!anyChecked && k === 0) ? 0 : -1}
              onClick={() => onChoose(o.value)}
              className={`group relative flex min-h-14 w-full items-center gap-3 rounded-[28px] border bg-surface px-4 py-3 text-left font-medium text-ink transition-[border-color,transform] duration-200 active:scale-[0.985] ${on ? "border-transparent" : "border-line hover:border-ink-3"}`}
            >
              {on && <motion.span layoutId={`${id}sel`} className="absolute inset-0 rounded-[28px] bg-brand-soft ring-2 ring-inset ring-brand" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
              <span className={`relative hidden h-7 w-7 shrink-0 place-items-center rounded-full text-[0.8125rem] font-semibold md:grid ${on ? "bg-brand-fill text-brand-ink" : "bg-sunken text-ink-3"}`} aria-hidden="true">
                {k + 1}
              </span>
              <span className="relative flex-1 md:pl-0.5">{o.label}</span>
              {on && (
                <motion.span className="relative grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-fill text-brand-ink" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 520, damping: 26 }} aria-hidden="true">
                  <Icon name="check" size={14} strokeWidth={2.6} />
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
