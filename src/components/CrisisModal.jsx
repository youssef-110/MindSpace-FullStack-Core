import { AnimatePresence, motion } from "framer-motion";
import { crisisResources } from "../lib/safety";

export default function CrisisModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="card max-w-lg w-full p-8 max-h-[85vh] overflow-y-auto"
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 12, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Crisis support resources"
          >
            <div className="text-4xl mb-4">💙</div>
            <h2 className="text-2xl font-extrabold mb-2 text-zinc-900 dark:text-white">
              You matter, and you don't have to face this alone
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
              It sounds like you might be going through something really heavy right now.
              MindSpace can keep you company, but a trained human can truly help.
              Please consider reaching out — right now, if you can.
            </p>

            <div className="space-y-3 mb-6">
              {crisisResources.map((r) => (
                <div
                  key={r.name}
                  className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900"
                >
                  <div className="font-bold text-zinc-900 dark:text-white text-sm">{r.name}</div>
                  <div className="text-teal-700 dark:text-teal-300 font-extrabold">{r.contact}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{r.note}</div>
                </div>
              ))}
            </div>

            <button onClick={onClose} className="btn-primary w-full py-3">
              I understand — continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
