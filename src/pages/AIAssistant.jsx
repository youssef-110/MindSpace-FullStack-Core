import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  load,
  save,
  isProUser,
  getDailyAiUsage,
  incrementDailyAiUsage,
  MAX_FREE_DAILY_MESSAGES,
} from "../lib/storage";
import { detectCrisis } from "../lib/safety";
import CrisisModal from "../components/CrisisModal";
import PricingModal from "../components/PricingModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const starters = [
  { icon: "⚖️", text: "Deconstruct my psychometric assessment results and cognitive schemas" },
  { icon: "🌪️", text: "Help me untangle an automatic cognitive distortion using CBT" },
  { icon: "🛡️", text: "Explain the difference between primary and secondary psychopathy" },
  { icon: "🔗", text: "How does my adult attachment style influence relationship conflict?" },
  { icon: "🧘", text: "Guide me through a DBT distress tolerance technique right now" },
  { icon: "💬", text: "I've been feeling emotionally depleted and need a supportive perspective" },
];

function renderMessage(text) {
  if (!text) return null;
  return text.split(/\n/).map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith("**") && p.endsWith("**") ? <strong key={j} className="font-bold">{p.slice(2, -2)}</strong> : p
    );
    const isBullet = /^\s*[-•*]\s+/.test(line);
    return (
      <span
        key={i}
        className={`block ${isBullet ? "pl-5 relative before:content-['•'] before:absolute before:left-1 before:text-teal-500" : ""} ${line.trim() === "" ? "h-2" : ""}`}
      >
        {isBullet ? parts.map((p) => (typeof p === "string" ? p.replace(/^\s*[-•*]\s+/, "") : p)) : parts}
      </span>
    );
  });
}

export default function AIAssistant() {
  const [searchParams] = useSearchParams();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => load("chat", []));
  const [loading, setLoading] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [online, setOnline] = useState(null);
  const [providerInfo, setProviderInfo] = useState("Groq LLaMA-3.3-70B");
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [isPro, setIsPro] = useState(isProUser());
  const [dailyUsage, setDailyUsage] = useState(getDailyAiUsage());
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const deepLinkHandled = useRef(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    save("chat", messages.slice(-80));
  }, [messages]);

  useEffect(() => {
    const updateTier = () => setIsPro(isProUser());
    const updateUsage = (e) => setDailyUsage(e.detail);
    window.addEventListener("mindspace:tier-change", updateTier);
    window.addEventListener("mindspace:usage-change", updateUsage);
    return () => {
      window.removeEventListener("mindspace:tier-change", updateTier);
      window.removeEventListener("mindspace:usage-change", updateUsage);
    };
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((r) => r.json())
      .then((data) => {
        setOnline(data.status === "ok");
        if (data.provider) setProviderInfo(data.provider);
      })
      .catch(() => setOnline(false));

    return () => window.speechSynthesis?.cancel();
  }, []);

  // Handle deep-link discussion from Tests.jsx
  useEffect(() => {
    const testId = searchParams.get("testId");
    if (testId && !deepLinkHandled.current) {
      deepLinkHandled.current = true;
      const testName = searchParams.get("testName") || testId.toUpperCase();
      const score = searchParams.get("score") || "Evaluated";
      const facets = searchParams.get("facets");
      const level = searchParams.get("level");
      const archetype = searchParams.get("archetype");

      let promptText = `I just completed the ${testName} check-in. `;
      if (facets) {
        promptText += `My subscale breakdown is: ${facets}. `;
      } else if (archetype) {
        promptText += `My cognitive archetype result is: ${archetype}. `;
      } else {
        promptText += `My overall score was: ${score} (${level || ""}). `;
      }
      promptText += "Can you give me a compassionate, clinical breakdown of what these psychometric scores mean for my behavioral patterns and cognitive schemas?";

      // Automatically send
      setTimeout(() => {
        send(promptText, {
          id: testId,
          name: testName,
          score,
          facets,
          level,
          archetype,
        });
      }, 400);
    }
  }, [searchParams]);

  const send = async (text, directTestContext = null) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    // Check message quota for free tier
    if (!isPro && dailyUsage.count >= MAX_FREE_DAILY_MESSAGES) {
      setShowPricing(true);
      return;
    }

    if (detectCrisis(content)) setShowCrisis(true);

    const userMessage = { role: "user", content };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput("");
    setLoading(true);

    if (!isPro) {
      const nextUsage = incrementDailyAiUsage();
      setDailyUsage(nextUsage);
    }

    // Prepare contextual memory
    const recentMoods = load("localMoods", []).slice(0, 5).map((m) => ({
      mood: m.moodValue,
      tags: m.tags || [],
      date: m.date,
    }));

    const recentJournals = load("journal", []).slice(0, 3).map((j) => ({
      prompt: j.title || j.practice || "Free write",
      text: j.text || j.reflection || "",
      date: j.date,
    }));

    // Placeholder message for streaming assistant tokens
    const assistantIndex = currentMessages.length;
    let fullResponse = "";

    try {
      const requestPayload = {
        message: content,
        history: messages.slice(-16).map((m) => ({ role: m.role, content: m.content })),
        mood_context: recentMoods,
        journal_context: recentJournals,
        test_context: directTestContext,
      };

      // 1. Try real-time SSE Streaming
      const streamRes = await fetch(`${API_URL}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      if (streamRes.ok && streamRes.body) {
        setOnline(true);
        const reader = streamRes.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        // Initialize empty AI message
        setMessages([...currentMessages, { role: "ai", content: "", streaming: true }]);

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const dataStr = line.slice(6).trim();
                if (dataStr === "[DONE]") {
                  done = true;
                  break;
                }
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.token) {
                    fullResponse += parsed.token;
                    setMessages((prev) => {
                      const updated = [...prev];
                      if (updated[assistantIndex]) {
                        updated[assistantIndex] = {
                          role: "ai",
                          content: fullResponse,
                          streaming: true,
                        };
                      }
                      return updated;
                    });
                  }
                } catch {
                  // Raw token fallback
                  if (dataStr && dataStr !== "[DONE]") {
                    fullResponse += dataStr;
                  }
                }
              }
            }
          }
        }

        // Finalize message
        setMessages((prev) => {
          const updated = [...prev];
          if (updated[assistantIndex]) {
            updated[assistantIndex] = {
              role: "ai",
              content: fullResponse,
              streaming: false,
            };
          }
          return updated;
        });
      } else {
        // 2. Fallback to standard /chat endpoint
        const res = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setMessages([...currentMessages, { role: "ai", content: data.answer, crisis: data.crisis }]);
        if (data.crisis) setShowCrisis(true);
        setOnline(true);
      }
    } catch {
      setOnline(false);
      setMessages([
        ...currentMessages,
        {
          role: "ai",
          content:
            "I'm currently unable to reach my clinical reasoning backend. 🛠️\n\n" +
            "To connect it: open your terminal and run `python mindspace-ai/main.py`.\n\n" +
            "In the meantime, your assessment results, mood tracker, and breathing exercises remain 100% functional offline in your browser.",
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
    const cleanText = text.replace(/[*#_~]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.96;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);
    setSpeakingIdx(idx);
    synth.speak(utterance);
  };

  const clearChat = () => {
    window.speechSynthesis?.cancel();
    setMessages([]);
    save("chat", []);
  };

  const remainingMessages = Math.max(0, MAX_FREE_DAILY_MESSAGES - dailyUsage.count);

  return (
    <div className="max-w-4xl mx-auto">
      <CrisisModal open={showCrisis} onClose={() => setShowCrisis(false)} />
      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />

      <div className="card flex flex-col h-[82vh] overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-2xl relative">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-gradient-to-r from-teal-50/70 via-indigo-50/50 to-purple-50/60 dark:from-teal-950/20 dark:via-zinc-900 dark:to-indigo-950/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-400 via-indigo-500 to-rose-400 flex items-center justify-center text-white text-base shadow-md">
                🧠
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 ${
                  online ? "bg-emerald-400 animate-pulse" : online === false ? "bg-zinc-400" : "bg-amber-400"
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-zinc-900 dark:text-white leading-tight text-base">
                  Dr. MindSpace
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  Clinical AI Psychiatrist
                </span>
              </div>
              <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <span>{providerInfo}</span>
                <span>•</span>
                <span className="text-teal-600 dark:text-teal-400">RAG Knowledge Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tier Pill */}
            {isPro ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-teal-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                👑 Pro Unlimited
              </span>
            ) : (
              <button
                onClick={() => setShowPricing(true)}
                className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
              >
                <span>{remainingMessages}/{MAX_FREE_DAILY_MESSAGES} msgs left</span>
                <span className="text-teal-600 dark:text-teal-400 font-extrabold ml-1">Upgrade 👑</span>
              </button>
            )}

            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="text-xs font-bold text-zinc-400 hover:text-rose-500 bg-white dark:bg-zinc-800/80 px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                title="Reset conversation"
              >
                New Session
              </button>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-teal-400 to-indigo-500 flex items-center justify-center text-3xl mb-4 shadow-xl shadow-teal-500/10">
                🌿
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-white mb-2">
                Clinical Psychological Consultation
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mb-8 leading-relaxed">
                I am Dr. MindSpace. I synthesize evidence-based psychometrics (TriPM, Dark Triad, OCEAN, PHQ-9), explore cognitive schemas, and offer structured CBT/DBT frameworks.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl">
                {starters.map((s) => (
                  <button
                    key={s.text}
                    onClick={() => send(s.text)}
                    className="text-left text-xs sm:text-sm font-medium p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-teal-400 dark:hover:border-teal-600 text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer hover:-translate-y-0.5 active:scale-[0.99] flex items-start gap-2.5"
                  >
                    <span className="text-lg leading-none">{s.icon}</span>
                    <span className="leading-snug">{s.text}</span>
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
                  className={`max-w-[88%] sm:max-w-[82%] px-5 py-4 text-[14.5px] leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-3xl rounded-br-md shadow-md shadow-teal-500/20"
                      : "bg-zinc-100/90 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 rounded-3xl rounded-bl-md border border-zinc-200/50 dark:border-zinc-700/50"
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed space-y-1">
                    {renderMessage(msg.content)}
                    {msg.streaming && (
                      <span className="inline-block w-2 h-4 ml-1 bg-teal-500 animate-pulse rounded" />
                    )}
                  </div>

                  {msg.role === "ai" && !msg.streaming && (
                    <div className="mt-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span className="font-semibold text-teal-600 dark:text-teal-400">Dr. MindSpace</span>
                      <button
                        onClick={() => speak(msg.content, i)}
                        className="font-bold flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
                      >
                        {speakingIdx === i ? "⏹ Stop audio" : "🔊 Listen"}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && !messages.some((m) => m.streaming) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-3xl rounded-bl-md px-5 py-4 flex items-center gap-2">
                <span className="typing-dot w-2 h-2 rounded-full bg-teal-500" />
                <span className="typing-dot w-2 h-2 rounded-full bg-indigo-500" />
                <span className="typing-dot w-2 h-2 rounded-full bg-rose-400" />
                <span className="text-xs font-semibold text-zinc-400 ml-2">Synthesizing clinical formulation…</span>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60">
          <div className="flex gap-2.5">
            <input
              ref={inputRef}
              className="flex-1 px-5 py-3.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-teal-400 dark:focus:ring-teal-600 transition-all text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask Dr. MindSpace about psychometrics, schemas, or emotional patterns…"
              aria-label="Message"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="btn-primary px-7 py-3 text-sm font-bold shadow-md shadow-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Send"
            >
              ↑
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2.5 px-2">
            <span>MindSpace Clinical AI is for psychoeducational consultation, not acute psychiatric diagnosis.</span>
            {!isPro && (
              <button
                onClick={() => setShowPricing(true)}
                className="text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
              >
                {remainingMessages} free queries left today (Get Pro)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
