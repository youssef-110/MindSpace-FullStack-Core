import { motion } from "framer-motion";

export default function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing halo */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-400/40 via-indigo-500/40 to-pink-500/30 blur-xl absolute"
        />
        {/* Core spinning/breathing orb */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-2 border-transparent border-t-teal-500 border-r-indigo-500 border-b-rose-400"
        />
        <div className="absolute font-display text-sm font-bold text-zinc-700 dark:text-zinc-200">
          🌿
        </div>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-5 text-xs font-semibold tracking-wider uppercase text-zinc-400 dark:text-zinc-500 font-sans"
      >
        Centering MindSpace…
      </motion.p>
    </div>
  );
}
