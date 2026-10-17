import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { streamChat } from "../lib/ai";
import { load, save } from "../lib/storage";
import { detectCrisis } from "../lib/safety";
import { latestSummaries } from "../lib/summary";
import { CrisisCallout } from "../components/ui";
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
      return <ul key={i} className="list-disc pl-5 space-y-1 mb-3">{lines.map((l, k) => <li key={k}>{bold(l.replace(/^\s*[-*•]\s/, ""))}</li>)}</ul>;
    }
    return <p key={i} className="mb-3 last:mb-0">{bold(block)}</p>;
  });
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
  const endRef = useRef(null);
  const { user, ready } = useAuth();
  const quota = useAiQuota();
  const [noticeAccepted, acceptNotice] = useAiNotice();
  const canSend = Boolean(user) && noticeAccepted && !busy && quota?.remaining !== 0 && !quota?.globalExhausted;

  useEffect(() => {
    save("chat", messages.slice(-30));
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function send(text) {
    const content = text.trim();
    if (!content || !canSend) return;
    if (detectCrisis(content)) setCrisis(true);
    const history = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setError("");
    setBusy(true);
    try {
      const { crisis: flagged } = await streamChat(
        history,
        (t) => setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: t }]),
        shareResults ? available : undefined
      );
      if (flagged) setCrisis(true);
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

  return (
    <div className="mx-auto flex max-w-3xl flex-col py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold">Ask AI</h1>
          <p className="mt-2 text-ink-2">Questions about psychology, the lessons, or what a test measures. It explains; it doesn't diagnose.</p>
        </div>
        {messages.length > 0 && (
          <button className="btn btn-quiet" onClick={() => { setMessages([]); setCrisis(false); }}>New conversation</button>
        )}
      </div>

      {available.length > 0 && (
        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-[var(--r-md)] bg-sunken p-4">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 accent-[var(--brand)]"
            checked={shareResults}
            onChange={(e) => setShareResults(e.target.checked)}
          />
          <span>
            <span className="font-bold">Use my latest results</span>
            <span className="block text-sm text-ink-2">
              Sends the scores from your {available.length} most recent test{available.length > 1 ? "s" : ""} (never your answers) to Google Gemini with your
              messages, so you can ask "what do my results say together?". Some of these scores relate to mental health.
            </span>
          </span>
        </label>
      )}

      {crisis && <div className="mt-6"><CrisisCallout compact /></div>}

      <div className="mt-8 space-y-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {(available.length && shareResults ? ["What do my results say when you put them together?", ...STARTERS.slice(0, 3)] : STARTERS).map((s) => (
              <button key={s} onClick={() => send(s)} disabled={!canSend} className="panel p-4 text-left text-[0.95rem] font-bold enabled:hover:border-ink-2 disabled:opacity-60 disabled:cursor-not-allowed">{s}</button>
            ))}
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="ml-auto max-w-[85%] rounded-[var(--r-md)] rounded-br-sm bg-ink px-4 py-3 text-paper">{m.content}</div>
          ) : (
            <div key={i} className="max-w-[92%] rounded-[var(--r-md)] rounded-bl-sm border border-line bg-surface px-4 py-3">
              {m.content ? <Formatted text={m.content} /> : <span className="inline-block h-4 w-24 animate-pulse rounded bg-sunken" aria-label="Thinking" />}
            </div>
          )
        )}
        {error && <p className="font-bold text-rose" role="alert">{error}</p>}
        <div ref={endRef} />
      </div>

      <div className="mt-6 space-y-3">
        {ready && !user && <SignInForAi what="chat with the AI" />}
        {user && !noticeAccepted && <AiNotice onAccept={acceptNotice} />}
        {user && <QuotaBadge quota={quota} />}
      </div>

      {user && (
        <form
          className="sticky bottom-[calc(66px+env(safe-area-inset-bottom))] md:bottom-4 mt-3 flex gap-2 rounded-[var(--r-md)] border border-line bg-surface p-2 shadow-[var(--shadow)] focus-within:border-brand"
          onSubmit={(e) => { e.preventDefault(); send(input); }}
        >
          <label htmlFor="ask-input" className="sr-only">Your question</label>
          <input
            id="ask-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={2000}
            placeholder={user ? "Ask about a concept or a result" : "Sign in to ask a question"}
            disabled={!user}
            className="min-h-[48px] min-w-0 flex-1 bg-transparent px-3 text-base"
            autoComplete="off"
            enterKeyHint="send"
          />
          <button className="btn btn-primary" disabled={!canSend || !input.trim()}>Send</button>
        </form>
      )}
      <p className="mt-3 text-xs text-ink-2">
        AI answers can be wrong. Conversations are saved only in this browser and are processed by Google Gemini to generate replies. Not for emergencies: <Link to="/help" className="link">get help now</Link>.
      </p>
    </div>
  );
}
