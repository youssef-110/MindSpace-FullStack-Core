import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { EASE, Icon } from "../ui";

// Top of a running test: a way out (drafts are saved as you go), the counter and a slim bar.
export default function Progress({ value, total, label, children }) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex min-h-11 items-center justify-between gap-4 text-sm">
        <Link to="/tests" className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 font-medium text-ink-3 transition-colors hover:text-ink">
          <Icon name="close" size={17} />
          Save and exit
        </Link>
        <div className="flex items-center gap-3">
          {children}
          <span className="num font-medium text-ink">{label}</span>
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-label="Progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={value} aria-valuetext={`${value} of ${total} answered`}>
        <motion.div className="h-full rounded-full bg-brand" initial={false} animate={{ x: `${((total ? value / total : 0) - 1) * 100}%` }} transition={{ duration: 0.5, ease: EASE }} />
      </div>
    </div>
  );
}
