import { motion } from "framer-motion";

// A pill picker for use on the sky: the white highlight slides between options (layoutId).
// `options` is a list of [value, text]. `id` must be unique per picker on the page.
export default function SkyPills({ id, label, options, value, onChange, className = "" }) {
  return (
    <div role="group" aria-label={label} className={`flex flex-wrap justify-center gap-2 ${className}`}>
      {options.map(([v, text]) => {
        const on = v === value;
        return (
          <button
            key={v}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(v)}
            className={`relative min-h-11 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-white ${on ? "text-black" : "bg-white/15 text-white hover:bg-white/25"}`}
          >
            {on && <motion.span layoutId={id} className="absolute inset-0 rounded-full bg-white" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
            <span className="num relative">{text}</span>
          </button>
        );
      })}
    </div>
  );
}
