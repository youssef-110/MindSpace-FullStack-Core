import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { load, appendToList, save } from "../lib/storage";
import { detectCrisis } from "../lib/safety";
import CrisisModal from "../components/CrisisModal";

const modes = [
  {
    id: "free",
    icon: "🖋️",
    name: "Free write",
    desc: "A blank page, just for you. No structure, no judgment.",
    fields: [{ key: "text", label: "What's on your mind?", placeholder: "Start anywhere. Nobody is reading this but you…" }],
  },
  {
    id: "gratitude",
    icon: "🌻",
    name: "Gratitude",
    desc: "Three good things — a practice shown to reliably lift mood over weeks.",
    fields: [
      { key: "g1", label: "One thing that went well today", placeholder: "Even something tiny counts…" },
      { key: "g2", label: "Something about a person you appreciate", placeholder: "Who made today a little lighter?" },
      { key: "g3", label: "Something about yourself you're grateful for", placeholder: "This one is often the hardest — try anyway." },
    ],
  },
  {
    id: "thought",
    icon: "🔍",
    name: "Thought record",
    desc: "The classic CBT tool: catch a thought, examine it, and reframe it.",
    fields: [
      { key: "situation", label: "The situation", placeholder: "What happened? Just the facts, like a camera would record it." },
      { key: "thought", label: "The automatic thought", placeholder: "What went through your mind? ('I always mess up', 'They hate me'…)" },
      { key: "feeling", label: "The feeling, and how strong (0–100%)", placeholder: "e.g. ashamed 80%, anxious 60%" },
      { key: "evidenceFor", label: "Evidence FOR the thought", placeholder: "What facts support it?" },
      { key: "evidenceAgainst", label: "Evidence AGAINST the thought", placeholder: "What facts don't fit? What would you tell a friend?" },
      { key: "reframe", label: "A more balanced thought", placeholder: "Not forced positivity — just something fairer and truer." },
    ],
  },
  {
    id: "unsent",
    icon: "✉️",
    name: "Unsent letter",
    desc: "Say what you never got to say — to a person, your past self, or your anxiety.",
    fields: [{ key: "text", label: "Dear…", placeholder: "Write the letter you'll never send. Let it all out." }],
  },
  {
    id: "worry",
    icon: "⏳",
    name: "Worry dump",
    desc: "Scheduled worry time shrinks background anxiety. Park it all here.",
    fields: [
      { key: "worries", label: "Empty every worry onto the page", placeholder: "Big, small, rational, irrational — all of it." },
      { key: "control", label: "Which of these can you actually influence?", placeholder: "Circle what's in your hands. The rest gets to stay on this page." },
      { key: "step", label: "One tiny next step for one worry", placeholder: "The smallest possible action." },
    ],
  },
];

export default function Journal() {
  const [mode, setMode] = useState(null);
  const [values, setValues] = useState({});
  const [entries, setEntries] = useState(() => load("journal", []));
  const [showCrisis, setShowCrisis] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const startMode = (m) => {
    setMode(m);
    setValues({});
  };

  const canSave = mode && mode.fields.some((f) => (values[f.key] || "").trim());

  const handleSave = () => {
    if (!canSave) return;
    const allText = Object.values(values).join(" ");
    if (detectCrisis(allText)) setShowCrisis(true);
    const entry = {
      id: `${Date.now()}`,
      mode: mode.id,
      modeName: mode.name,
      icon: mode.icon,
      fields: mode.fields.map((f) => ({ label: f.label, value: values[f.key] || "" })).filter((f) => f.value.trim()),
      date: new Date().toISOString(),
    };
    setEntries(appendToList("journal", entry));
    setMode(null);
    setValues({});
  };

  const deleteEntry = (id) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    save("journal", next);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <CrisisModal open={showCrisis} onClose={() => setShowCrisis(false)} />

      <header className="text-center mb-10">
        <h1 className="font-display text-5xl font-semibold text-zinc-900 dark:text-white mb-3">Journal</h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          Writing about feelings measurably reduces their grip. Pick a practice — everything stays on this device.
        </p>
      </header>

      <AnimatePresence mode="wait">
        {!mode ? (
          <motion.div key="picker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
              {modes.map((m, i) => (
                <motion.button
                  key={m.id}
                  onClick={() => startMode(m)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card card-hover p-6 text-left cursor-pointer"
                >
                  <div className="text-3xl mb-3">{m.icon}</div>
                  <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white mb-1">{m.name}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{m.desc}</p>
                </motion.button>
              ))}
            </div>

            {entries.length > 0 && (
              <section>
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 ml-2">Past entries · {entries.length}</h2>
                <div className="space-y-3">
                  {entries.slice(0, 20).map((e) => (
                    <div key={e.id} className="card p-5">
                      <button className="w-full flex items-center justify-between cursor-pointer" onClick={() => setExpanded(expanded === e.id ? null : e.id)}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{e.icon}</span>
                          <div className="text-left">
                            <div className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{e.modeName}</div>
                            <div className="text-xs text-zinc-400">
                              {new Date(e.date).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                            </div>
                          </div>
                        </div>
                        <span className="text-zinc-400 text-sm">{expanded === e.id ? "▲" : "▼"}</span>
                      </button>
                      <AnimatePresence>
                        {expanded === e.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                              {e.fields.map((f, i) => (
                                <div key={i}>
                                  <div className="text-[10px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400">{f.label}</div>
                                  <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap mt-1">{f.value}</p>
                                </div>
                              ))}
                              <button onClick={() => deleteEntry(e.id)} className="text-xs font-bold text-rose-500 hover:text-rose-600 cursor-pointer">
                                Delete entry
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        ) : (
          <motion.div key="editor" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card p-8">
            <button onClick={() => setMode(null)} className="text-sm font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 mb-5 cursor-pointer">
              ← Back
            </button>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{mode.icon}</span>
              <div>
                <h2 className="font-extrabold text-xl text-zinc-900 dark:text-white">{mode.name}</h2>
                <p className="text-xs text-zinc-400">{mode.desc}</p>
              </div>
            </div>

            <div className="space-y-5">
              {mode.fields.map((f) => (
                <label key={f.key} className="block">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{f.label}</span>
                  <textarea
                    value={values[f.key] || ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    rows={mode.fields.length === 1 ? 10 : 3}
                    className="w-full mt-2 p-4 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-teal-300 dark:focus:ring-teal-800 transition-all resize-none leading-relaxed"
                  />
                </label>
              ))}
            </div>

            <button onClick={handleSave} disabled={!canSave} className="btn-primary w-full py-3.5 mt-6">
              Save entry
            </button>
            <p className="text-[11px] text-zinc-400 text-center mt-3">Stored only in this browser. Never uploaded.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
