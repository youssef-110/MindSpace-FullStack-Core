import { useEffect, useRef, useState } from "react";
import { useMotionValue, useReducedMotion } from "framer-motion";
import { LOW, phaseAt } from "./timeline";

const REST = 0.85; // orb size when motion is reduced: it never scales

// Runs one breathing session. `performance.now()` is the only clock: each frame recomputes the
// phase from elapsed time, and React state changes only when a whole second or a phase changes.
export function useBreathClock(pattern, totalMs) {
  const reduce = useReducedMotion();
  const [status, setStatus] = useState("idle"); // idle | running | paused | done
  const [tick, setTick] = useState(null);
  const scale = useMotionValue(reduce ? REST : LOW);
  const elapsed = useRef(0); // ms breathed so far, kept across pauses

  useEffect(() => {
    if (status !== "running") return;
    const t0 = performance.now() - elapsed.current;
    let raf;
    const frame = () => {
      const ms = Math.min(Math.max(0, performance.now() - t0), totalMs);
      elapsed.current = ms;
      const at = phaseAt(pattern, ms);
      if (!reduce) scale.set(at.scale);
      const remaining = Math.ceil((totalMs - ms) / 1000);
      setTick((prev) => (prev && prev.index === at.index && prev.left === at.left && prev.breaths === at.breaths && prev.remaining === remaining ? prev : { index: at.index, left: at.left, breaths: at.breaths, remaining }));
      if (ms >= totalMs) return setStatus("done");
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [status, pattern, totalMs, reduce, scale]);

  function reset() {
    elapsed.current = 0;
    scale.set(reduce ? REST : LOW);
    setTick(null);
    setStatus("idle");
  }

  function toggle() {
    if (status === "running") return setStatus("paused");
    if (status === "done") {
      elapsed.current = 0;
      setTick(null);
    }
    setStatus("running");
  }

  const view = tick ?? { index: 0, left: Math.ceil(pattern.phases[0][1]), breaths: 0, remaining: totalMs / 1000 };
  return { status, scale, toggle, reset, ...view };
}
