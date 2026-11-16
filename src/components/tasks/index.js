import { lazy } from "react";

// Interactive cognitive tasks, keyed by test id. Each component receives { test, onComplete(result) }.
// Lazy, so each task ships as its own chunk.
export const TASK_COMPONENTS = {
  "reaction-time": lazy(() => import("./ReactionTime.jsx")),
  "digit-span": lazy(() => import("./DigitSpan.jsx")),
  stroop: lazy(() => import("./Stroop.jsx")),
};
