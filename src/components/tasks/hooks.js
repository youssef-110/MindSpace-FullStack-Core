import { useCallback, useEffect, useEffectEvent, useMemo, useRef } from "react";

// Timeouts and animation frames that can all be cancelled at once (on pause) and that die
// with the component.
export function useTimers() {
  const pending = useRef(new Set());
  const clear = useCallback(() => {
    for (const cancel of pending.current) cancel();
    pending.current.clear();
  }, []);
  const after = useCallback((ms, fn) => {
    const cancel = () => clearTimeout(id);
    const id = setTimeout(() => {
      pending.current.delete(cancel);
      fn();
    }, ms);
    pending.current.add(cancel);
  }, []);
  const frame = useCallback((fn) => {
    const cancel = () => cancelAnimationFrame(id);
    const id = requestAnimationFrame(() => {
      pending.current.delete(cancel);
      fn();
    });
    pending.current.add(cancel);
  }, []);
  useEffect(() => clear, [clear]);
  return useMemo(() => ({ after, frame, clear }), [after, frame, clear]);
}

// Runs `onLeave` when the tab is hidden or the window loses focus.
export function useLeave(onLeave) {
  const leave = useEffectEvent(onLeave);
  useEffect(() => {
    const hidden = () => document.hidden && leave();
    const blur = () => leave();
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("blur", blur);
    return () => {
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("blur", blur);
    };
  }, []);
}

// keydown, not keyup or click: it is the earliest event a key press produces.
export function useKeyDown(onKey) {
  const key = useEffectEvent(onKey);
  useEffect(() => {
    const down = (e) => !e.repeat && !e.metaKey && !e.ctrlKey && !e.altKey && key(e);
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, []);
}

// Keeps the response controls clear of the floating tab capsule on phones: scrolls `ref`
// into view (it carries a scroll margin) whenever `when` changes.
export function useKeepVisible(ref, when) {
  useEffect(() => {
    ref.current?.scrollIntoView({ block: "nearest" });
  }, [ref, when]);
}

// Milliseconds from `t0` to the event. The event's own timestamp is taken when the input
// arrived, so it leaves out time spent queued behind other work; fall back to "now" when a
// browser reports it on a different clock.
export function elapsed(e, t0) {
  const now = performance.now();
  return (e && e.timeStamp > t0 && e.timeStamp <= now ? e.timeStamp : now) - t0;
}
