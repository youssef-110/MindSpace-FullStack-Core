import { useState } from "react";
import { motion } from "framer-motion";
import { byId } from "../../lib/tests/questionnaires";
import { explainResult } from "../../lib/ai";
import { summarize } from "../../lib/summary";
import { useAuth } from "../../lib/auth-context";
import { useAiQuota } from "../../lib/useAiQuota";
import { useAiNotice } from "../../lib/useAiNotice";
import { QuotaBadge, SignInForAi, AiNotice } from "../AiAccess";
import { EASE, Icon } from "../ui";

export default function AiExplain({ entry }) {
  const { user, ready } = useAuth();
  const quota = useAiQuota();
  const [noticeAccepted, acceptNotice] = useAiNotice();
  const [state, setState] = useState({ status: "idle" });
  // Mood, personality-pattern and neurodiversity scores relate to health: confirm each time they're sent.
  const test = byId(entry.testId);
  const healthRelated = test?.sensitive || ["wellbeing", "patterns", "neuro", "relationships"].includes(test?.category);
  const [sendOk, setSendOk] = useState(!healthRelated);
  const run = async () => {
    setState({ status: "loading" });
    try {
      const data = await explainResult(entry.testId, summarize(entry.result));
      setState({ status: "done", data });
    } catch (e) {
      setState({ status: "error", message: e.message, retry: !["user", "global", "auth"].includes(e.reason) });
    }
  };
  const blocked = quota?.remaining === 0 || quota?.globalExhausted;
  return (
    <section className="card no-print p-5 sm:p-8" aria-labelledby="ai">
      <div className="flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-text" aria-hidden="true">
          <Icon name="spark" size={20} />
        </span>
        <div>
          <h2 id="ai" className="font-sans text-xl font-semibold tracking-[-0.02em]">Explain this result in plain words</h2>
          <p className="mt-1 text-sm text-ink-3">Sends only the scores above to the AI, never your answers. The AI can't change your score.</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {ready && !user && <SignInForAi what="get an AI explanation" />}
        {user && !noticeAccepted && <AiNotice onAccept={acceptNotice} />}
        {user && noticeAccepted && state.status === "idle" && (
          <>
            {healthRelated && (
              <label className="flex min-h-11 items-start gap-3 text-[0.9375rem]">
                <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--brand)]" checked={sendOk} onChange={(e) => setSendOk(e.target.checked)} />
                <span>Send these scores, which relate to mental health, to Google Gemini to get an explanation.</span>
              </label>
            )}
            <button className="btn btn-primary" onClick={run} disabled={blocked || !sendOk}>
              <Icon name="spark" size={18} />
              Explain with AI
            </button>
            <QuotaBadge quota={quota} />
          </>
        )}
      </div>
      {state.status === "loading" && (
        <div className="mt-5 space-y-2.5" aria-busy="true" aria-label="Loading explanation">
          {[90, 75, 82].map((w) => <div key={w} className="skeleton h-4" style={{ width: `${w}%` }} />)}
        </div>
      )}
      <div aria-live="polite">
        {state.status === "error" && (
          <div className="mt-5">
            <p className="font-semibold text-rose" role="alert">{state.message}</p>
            <p className="mt-1 text-sm text-ink-3">Your result above is complete without it.</p>
            {state.retry && <button className="btn btn-ghost mt-4" onClick={run}>Try again</button>}
          </div>
        )}
        {state.status === "done" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="mt-5 space-y-3">
            <p className="text-ink">{state.data.summary}</p>
            <ul className="list-disc space-y-1.5 pl-5">{state.data.points.map((p) => <li key={p}>{p}</li>)}</ul>
            <p className="text-sm text-ink-3">{state.data.caution}</p>
            <p className="text-xs text-ink-3">Written by AI and may contain mistakes.{state.data.cached ? " Loaded from cache, so it didn't use a request." : ""}</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
