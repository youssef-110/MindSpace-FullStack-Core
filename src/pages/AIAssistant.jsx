import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { load, save } from "../lib/storage";
import { detectCrisis } from "../lib/safety";
import CrisisModal from "../components/CrisisModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const starters = [
  { icon: "🌫️", text: "I've been feeling off lately and I don't know why" },
  { icon: "🌀", text: "Help me untangle an anxious thought" },
  { icon: "😔", text: "I keep being really hard on myself" },
  { icon: "🛏️", text: "My sleep is a mess — where do I start?" },
  { icon: "🧭", text: "I want to understand myself better" },
  { icon: "💬", text: "I just need someone to listen for a minute" },
];

// Minimal markdown: **bold**, bullet lines, paragraphs.
function renderMessage(text) {
  return text.split(/\n/).map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith("**") && p.endsWith("**") ? <strong key={j}>{p.slice(2, -2)}</strong> : p
    );
    const isBullet = /^\s*[-•*]\s+/.test(line);
    return (
      <span key={i} className={`block ${isBullet ? "pl-4 relative before:content-['•'] before:absolute before:left-1" : ""} ${line.trim() === "" ? "h-2" : ""}`}>
        {isBullet ? parts.map((p) => (typeof p === "string" ? p.replace(/^\s*[-•*]\s+/, "") : p)) : parts}
      </span>
    );
  });
}

export default function AIAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => load("chat", []));
  const [loading, setLoading] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [online, setOnline] = useState(null);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    save("chat", messages.slice(-60));
  }, [messages]);

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((r) => setOnline(r.ok))
      .catch(() => setOnline(false));
    return () => window.speechSynthesis?.cancel();
  }, []);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    if (detectCrisis(content)) setShowCrisis(true);

    const userMessage = { role: "user", content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Give the AI gentle context about the user's recent state (stays local otherwise)
    const recentMoods = load("localMoods", []).slice(0, 5).map((m) => ({
      mood: m.moodValue, tags: m.tags || [], date: m.date,
    }));

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history: messages.slice(-16).map((m) => ({ role: m.role, content: m.content })),
          mood_context: recentMoods,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages([...newMessages, { role: "ai", content: data.answer, crisis: data.crisis }]);
      if (data.crisis) setShowCrisis(true);
      setOnline(true);
    } catch {
      setOnline(false);
      setMessages([
        ...newMessages,
        {
          role: "ai",
          content:
            "I can't reach my brain right now (the backend isn't responding). 🛠️\n\nTo start it: open a terminal in **mindspace-ai/** and run `python main.py`.\n\nMeanwhile, the **Breathe**, **Journal**, and **Learn** pages work fully offline — and if this is urgent, the **Resources** page has real humans available 24/7.",
        },
      ]);
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const speak = (text, idx) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    if (speakingIdx === idx) {
      setSpeakingIdx(null);
      return;
    }
    const u = new SpeechSynthesisUtterance(text.replace(/\*\*/g, ""));
    u.rate = 0.95;
    u.onend = () => setSpeakingIdx(null);
    setSpeakingIdx(idx);
    synth.speak(u);
  };

  const clearChat = () => {
    window.speechSynthesis?.cancel();
    setMessages([]);
    save("chat", []);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <CrisisModal open={showCrisis} onClose={() => setShowCrisis(false)} />

      <div className="card flex flex-col h-[78vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-teal-50/60 to-indigo-50/60 dark:from-teal-950/20 dark:to-indigo-950/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-lg shadow-md">✨</div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 ${online ? "bg-emerald-400" : online === false ? "bg-zinc-400" : "bg-amber-400"}`} />
            </div>
            <div>
              <div className="font-extrabold text-zinc-900 dark:text-white leading-tight">MindSpace Companion</div>
              <div className="text-[11px] font-bold text-zinc-400">
                {online ? "here with you" : online === false ? "backend offline" : "connecting…"}
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat} className="text-xs font-bold text-zinc-400 hover:text-rose-500 bg-zinc-100 dark:bg-zinc-800 px-3.5 py-2 rounded-full transition-colors cursor-pointer">
              New conversation
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="text-5xl mb-4 animate-float">🫧</div>
              <h2 className="font-display text-2xl font-semibold text-zinc-900 dark:text-white mb-2">What's on your mind?</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-8">
                I'm a psychology-informed companion — here to listen, help you sort through feelings,
                and share evidence-based tools. I'm not a therapist, but I'm a good place to start.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
                {starters.map((s) => (
                  <button
                    key={s.text}
                    onClick={() => send(s.text)}
                    className="text-left text-sm font-medium px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 hover:border-teal-400 dark:hover:border-teal-600 text-zinc-600 dark:text-zinc-300 transition-all cursor-pointer hover:-translate-y-0.5"
                  >
                    <span className="mr-2">{s.icon}</span>{s.text}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-5 py-3.5 text-[15px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-3xl rounded-br-lg shadow-md shadow-teal-500/20"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-3xl rounded-bl-lg"
                  }`}
                >
                  <div className="whitespace-pre-wrap [&>span]:min-h-[1em]">{renderMessage(msg.content)}</div>
                  {msg.role === "ai" && (
                    <button
                      onClick={() => speak(msg.content, i)}
                      className="mt-2 text-[11px] font-bold opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {speakingIdx === i ? "⏹ Stop" : "🔊 Listen"}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-3xl rounded-bl-lg px-5 py-4 flex gap-1.5">
                <span className="typing-dot w-2 h-2 rounded-full bg-zinc-400" />
                <span className="typing-dot w-2 h-2 rounded-full bg-zinc-400" />
                <span className="typing-dot w-2 h-2 rounded-full bg-zinc-400" />
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex gap-2.5">
            <input
              ref={inputRef}
              className="flex-1 px-5 py-3.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-teal-300 dark:focus:ring-teal-700 transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Share what you're feeling…"
              aria-label="Message"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="btn-primary px-7"
              aria-label="Send"
            >
              ↑
            </button>
          </div>
          <p className="text-[10px] text-zinc-400 text-center mt-2.5">
            The Companion offers support and psychoeducation — not therapy, diagnosis, or medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
