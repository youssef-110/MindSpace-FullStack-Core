import { motion } from "framer-motion";
import { Icon } from "../ui";

// Lives on the sky only, so its colours are fixed whites and a night-blue core (see DESIGN.md).
// The glow, disc and rings share one transform driven by the session clock; the core holding the
// text never scales, so the label stays crisp and readable against the dark centre.
export default function Orb({ scale, status, label, count }) {
  const idle = status === "idle";
  const done = status === "done";
  return (
    <div className="relative grid aspect-square w-[min(17rem,68vw)] place-items-center" aria-hidden="true">
      <motion.div className="absolute inset-0 will-change-transform" style={{ scale }}>
        <div className="absolute -inset-[24%] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.16) 46%, rgba(255,255,255,0) 68%)" }} />
        <div className="absolute -inset-[15%] rounded-full border border-white/20" />
        <div className="absolute -inset-[7.5%] rounded-full border border-white/35" />
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 50% 38%, rgba(255,255,255,0.96) 0%, rgba(255,240,218,0.82) 58%, rgba(255,220,186,0.6) 100%)" }} />
      </motion.div>
      <div className="relative grid aspect-square w-[56%] place-items-center rounded-full bg-[rgba(18,22,76,0.78)] text-center text-white">
        {idle || done ? (
          <div className="grid justify-items-center gap-1.5">
            <Icon name={done ? "check" : "wind"} size={30} />
            <span className="text-sm font-medium">{done ? "Complete" : "Ready"}</span>
          </div>
        ) : (
          <div className="grid justify-items-center">
            <span className="max-w-[7.25rem] text-balance text-sm font-medium leading-tight">{status === "paused" ? "Paused" : label}</span>
            <span className="display num mt-1 text-[3.25rem] text-white">{count}</span>
          </div>
        )}
      </div>
    </div>
  );
}
