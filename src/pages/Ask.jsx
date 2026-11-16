import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { streamChat } from "../lib/ai";
import { load, save } from "../lib/storage";
import { detectCrisis } from "../lib/safety";
import { latestSummaries } from "../lib/summary";
import { CrisisCallout, EASE, Icon, LogoMark, PageHeader, Stagger, StaggerItem } from "../components/ui";
import { QuotaBadge, SignInForAi, AiNotice } from "../components/AiAccess";
import { useAuth } from "../lib/auth-context";
import { useAiQuota } from "../lib/useAiQuota";
import { useAiNotice } from "../lib/useAiNotice";

const STARTERS = [
  "What's the difference between a trait and a type?",
  "Why is an online IQ number only an estimate?",
  "What does 'sensitivity' mean for a screener?",
  "How is borderline personality disorder treated?",
];

// Light formatting for AI text: paragraphs, "- " bullets and **bold**. No HTML is injected.
function Formatted({ text }) {
  return text.split(/\n{2,}/).map((block, i) => {
    const lines = block.split("\n");
    const bold = (s) => s.split(/\*\*(.+?)\*\*/g).map((part, k) => (k % 2 ? <strong key={k}>{part}</strong> : part));
    if (lines.every((l) => /^\s*[-*•]\s/.test(l))) {
      return <ul key={i} className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{lines.map((l, k) => <li key={k}>{bold(l.replace(/^\s*[-*•]\s/, ""))}</li>)}</ul>;
    }
    return <p key={i} className="mb-3 last:mb-0">{bold(block)}</p>;
  });
}

function Typing() {
  return (
    <span className="flex h-6 items-center gap-1.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="h-2 w-2 rounded-full bg-ink-3" animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.16, ease: "easeInOut" }} />
      ))}
    </span>
  );
}

export default function Ask() {
  const [messages, setMessages] = useState(() => load("chat", []));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [crisis, setCrisis] = useState(false);
  // Not remembered between visits: sharing health-related scores is a fresh choice each time.
  const [shareResults, setShareResults] = useState(false);
  const [available] = useState(() => latestSummaries());
  const [confirmClear, setConfirmClear] = useState(false);
  // The finished reply, read out once by the hidden live region (streaming chunks are not).
  const [spoken, setSpoken] = useState("");
  const endRef = useRef(null);
  const boxRef = useRef(null);
  const { user, ready } = useAuth();
  const quota = useAiQuota();
  const [noticeAccepted, acceptNotice] = useAiNotice();
  const canSend = Boolean(user) && noticeAccepted && !busy && quota?.remaining !== 0 && !quota?.globalExhausted;
  const waiting = busy && !messages.at(-1)?.content;

  useEffect(() => {
    save("chat", messages.slice(-30));
  }, [messages]);

  // Keep the newest message, error or crisis panel in view.
  useEffect(() => {
    if (messages.length || error || crisis) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, error, crisis]);

  // The composer grows with its text, up to its max height.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    box.style.height = "auto";
    box.style.height = `${box.scrollHeight}px`;
  }, [input]);

  async function send(text) {
    const content = text.trim();
    if (!content || !canSend) return;
    if (detectCrisis(content)) setCrisis(true);
    const history = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setError("");
    setSpoken("");
    setConfirmClear(false);
    setBusy(true);
    try {
      const { crisis: flagged, text: reply } = await streamChat(
        history,
        (t) => setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: t }]),
        shareResults ? available : undefined
      );
      if (flagged) setCrisis(true);
      setSpoken(reply);
    } catch (e) {
      setError(e.message);
      // If nothing came back, remove the question from the thread and put it back in the box.
      setMessages((m) => {
        if (m.at(-1)?.content) return m;
        setInput(content);
        return m.slice(0, -2);
      });
    } finally {
      setBusy(false);
    }
  }

  function clear() {
    setMessages([]);
    setCrisis(false);
    setError("");
    setSpoken("");
    setConfirmClear(false);
  }

  const starters = available.length && shareResults ? ["What do my results say when you put them together?", ...STARTERS.slice(0, 3)] : STARTERS;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Ask AI" lead="Questions about psychology, the lessons, or what a test measures. It explains; it doesn't diagnose." className="mb-8 md:mb-10" />

      {available.length > 0 && (
        <label className="well mb-8 flex cursor-pointer items-start gap-3 p-4">
          <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--brand)]" checked={shareResults} onChange={(e) => setShareResults(e.target.checked)} />
          <span>
            <span className="font-semibold text-ink">Use my latest results</span>
            <span className="mt-0.5 block text-sm text-ink-2">
              Sends the scores from your {available.length} most recent test{available.length > 1 ? "s" : ""} (never your answers) to Google Gemini with your
              messages, so you can ask "what do my results say together?". Some of these scores relate to mental health.
            </span>
          </span>
        </label>
      )}

      {messages.length === 0 ? (
        <div className="py-6 text-center sm:py-10">
          <LogoMark size={48} className="animate-float mx-auto" />
          <h2 className="mt-6 text-[1.75rem] sm:text-[2rem]">What would you like to understand?</h2>
          <Stagger className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2" delay={0.1}>
            {starters.map((s) => (
              <StaggerItem key={s}>
                <button
                  type="button"
                  onClick={() => send(s)}
                  disabled={!canSend}
                  className="min-h-11 rounded-[22px] border border-line bg-surface px-4 py-2.5 text-left text-sm font-medium text-ink transition-colors enabled:hover:border-ink-3 enabled:hover:bg-sunken disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {s}
                </button>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      ) : (
        <>
          <div className="mb-4 flex min-h-11 flex-wrap items-center justify-between gap-2">
            {confirmClear ? (
              <div className="ml-auto flex flex-wrap items-center gap-2" role="group" aria-label="Clear this conversation?">
                <span className="mr-1 text-sm text-ink-2">Clear this conversation?</span>
                <button type="button" className="btn btn-dark btn-sm min-h-11" onClick={clear}>
                  Clear
                </button>
                <button type="button" className="btn btn-soft btn-sm min-h-11" onClick={() => setConfirmClear(false)} autoFocus>
                  Keep
                </button>
              </div>
            ) : (
              <>
                <p className="eyebrow">Conversation</p>
                <button type="button" className="btn btn-soft btn-sm min-h-11" onClick={() => setConfirmClear(true)} disabled={busy}>
                  <Icon name="trash" size={16} />
                  Clear conversation
                </button>
              </>
            )}
          </div>

          {/* Streaming text would flood a live region, so the log is quiet and the status line below speaks. */}
          <div className="space-y-4" role="log" aria-live="off" aria-label="Conversation">
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className={m.role === "user" ? "flex justify-end" : "flex items-end gap-2.5"}>
                {m.role === "user" ? (
                  <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-[22px] rounded-br-[8px] bg-brand-soft px-4 py-3 text-ink">
                    <span className="sr-only">You: </span>
                    {m.content}
                  </div>
                ) : (
                  <>
                    <LogoMark size={28} className="mb-1 hidden sm:block" />
                    <div className="max-w-[92%] break-words rounded-[22px] rounded-bl-[8px] border border-line bg-surface px-4 py-3 sm:max-w-[85%]">
                      <span className="sr-only">Assistant: </span>
                      {m.content ? <Formatted text={m.content} /> : busy && i === messages.length - 1 ? <Typing /> : <span className="text-ink-3">No reply came back for this one.</span>}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}

      <p className="sr-only" role="status">
        {waiting ? "The assistant is writing." : busy ? "" : spoken}
      </p>

      {error && (
        <div role="alert" className="mt-4 flex flex-wrap items-center gap-3 rounded-[var(--r-md)] bg-rose-soft p-4 text-sm font-medium text-rose">
          <Icon name="alert" size={18} />
          <span className="min-w-0 flex-1">{error}</span>
          {input.trim() && (
            <button type="button" className="btn btn-ghost btn-sm min-h-11" onClick={() => send(input)} disabled={!canSend}>
              <Icon name="refresh" size={16} />
              Try again
            </button>
          )}
        </div>
      )}

      {/* Next to the composer, where the person is looking, not above a long thread. */}
      {crisis && (
        <div className="mt-6">
          <CrisisCallout compact />
        </div>
      )}

      <div ref={endRef} className="scroll-mb-60" />

      <div className="mt-6 space-y-3">
        {ready && !user && <SignInForAi what="chat with the AI" />}
        {user && !noticeAccepted && <AiNotice onAccept={acceptNotice} />}
        {user && <QuotaBadge quota={quota} />}
      </div>

      {user && (
        <form
          // Sticky, above the phone tab capsule (about 84px tall).
          className="card sticky bottom-24 z-30 mt-3 flex items-end gap-2 rounded-[28px] p-2 transition-[border-color,box-shadow] focus-within:border-brand focus-within:shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand)_18%,transparent)] md:bottom-6"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <label htmlFor="ask-input" className="sr-only">
            Your question
          </label>
          <textarea
            id="ask-input"
            ref={boxRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends, Shift+Enter adds a line. Leave Enter alone while an IME is composing.
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send(input);
              }
            }}
            maxLength={2000}
            placeholder="Ask about a concept or a result"
            className="max-h-40 min-h-12 min-w-0 flex-1 resize-none bg-transparent px-4 py-3 text-ink outline-none placeholder:text-ink-3"
            autoComplete="off"
            enterKeyHint="send"
          />
          <button type="submit" className="btn btn-primary h-12 w-12 shrink-0 p-0" aria-label="Send message" disabled={!canSend || !input.trim()}>
            <Icon name="send" size={20} />
          </button>
        </form>
      )}

      <p className="mt-5 flex items-start justify-center gap-2 text-sm font-medium text-ink-2">
        <Icon name="shield" size={18} className="mt-px text-ink-3" />
        The assistant explains ideas and results. It never scores or diagnoses.
      </p>
      <p className="mx-auto mt-2 max-w-xl text-center text-xs text-ink-3">
        AI answers can be wrong. Conversations are saved only in this browser and are processed by Google Gemini to generate replies. Not for emergencies:{" "}
        <Link to="/help" className="link">get help now</Link>.
      </p>
    </div>
  );
}
