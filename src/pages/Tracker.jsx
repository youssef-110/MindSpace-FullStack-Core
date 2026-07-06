import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { load, save } from "../lib/storage";

// Firebase is best-effort sync; localStorage is the source of truth so the
// tracker works fully offline / without configuration.
let fb = null;
async function getFirebase() {
  if (fb !== null) return fb;
  try {
    const { db } = await import("../firebase");
    const fs = await import("firebase/firestore");
    fb = { db, ...fs };
  } catch {
    fb = false;
  }
  return fb;
}

const moods = [
  { value: 1, emoji: "🌪️", label: "Rough" },
  { value: 2, emoji: "🌧️", label: "Low" },
  { value: 3, emoji: "⛅", label: "Okay" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "🌟", label: "Great" },
];

const emotionTags = ["anxious", "calm", "sad", "grateful", "angry", "hopeful", "tired", "energized", "lonely", "connected", "overwhelmed", "proud"];

function computeStreak(entries) {
  if (!entries.length) return 0;
  const days = new Set(entries.map((e) => new Date(e.timestamp).toDateString()));
  let streak = 0;
  const d = new Date();
  // Allow the streak to count if today hasn't been logged yet
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function TrendChart({ entries }) {
  const pts = [...entries].reverse().slice(-14);
  if (pts.length < 2)
    return <p className="text-sm text-zinc-400 text-center py-8">Log a few days to see your trend line 🌱</p>;

  const w = 280, h = 90, pad = 8;
  const step = (w - pad * 2) / (pts.length - 1);
  const y = (v) => h - pad - ((v - 1) / 4) * (h - pad * 2);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${pad + i * step} ${y(p.moodValue)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Mood trend over the last 14 check-ins">
      {[1, 3, 5].map((v) => (
        <line key={v} x1={pad} x2={w - pad} y1={y(v)} y2={y(v)} className="stroke-zinc-100 dark:stroke-zinc-800" strokeWidth="1" />
      ))}
      <motion.path
        d={path} fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className="stroke-teal-500"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeOut" }}
      />
      {pts.map((p, i) => (
        <circle key={i} cx={pad + i * step} cy={y(p.moodValue)} r="3" className="fill-teal-500" />
      ))}
    </svg>
  );
}

export default function Tracker() {
  const [moodValue, setMoodValue] = useState(4);
  const [note, setNote] = useState("");
  const [tags, setTags] = useState([]);
  const [sleep, setSleep] = useState(7);
  const [energy, setEnergy] = useState(3);
  const [history, setHistory] = useState(() => load("localMoods", []));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    save("localMoods", history);
  }, [history]);

  const toggleTag = (t) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t].slice(0, 4)));

  const handleSave = async () => {
    const now = new Date();
    const entry = {
      id: `${Date.now()}`,
      moodValue,
      mood: moods.find((m) => m.value === moodValue).emoji,
      note: note.trim(),
      tags,
      sleep,
      energy,
      date: now.toLocaleDateString(),
      timestamp: Date.now(),
    };
    setHistory((h) => [entry, ...h]);
    setNote("");
    setTags([]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    // Fire-and-forget cloud sync
    const f = await getFirebase();
    if (f) {
      try {
        await f.addDoc(f.collection(f.db, "moods"), entry);
      } catch (e) {
        console.warn("Cloud sync skipped:", e.message);
      }
    }
  };

  const handleDelete = (id) => setHistory((h) => h.filter((e) => e.id !== id));

  const streak = useMemo(() => computeStreak(history), [history]);
  const avgMood = history.length
    ? (history.slice(0, 30).reduce((s, e) => s + (e.moodValue ?? 3), 0) / Math.min(history.length, 30)).toFixed(1)
    : "–";
  const topTag = useMemo(() => {
    const counts = {};
    history.slice(0, 30).forEach((e) => (e.tags || []).forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "–";
  }, [history]);

  const loggedDays = new Set(
    history
      .filter((e) => new Date(e.timestamp).getMonth() === new Date().getMonth())
      .map((e) => new Date(e.timestamp).getDate())
  );
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

  return (
    <div className="max-w-6xl mx-auto">
      <header className="text-center mb-10">
        <h1 className="font-display text-5xl font-semibold text-zinc-900 dark:text-white mb-3">Daily check-in</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Sixty honest seconds. That's all a check-in takes.</p>
      </header>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
        {[
          { label: "Day streak", value: streak > 0 ? `🔥 ${streak}` : "—" },
          { label: "Avg mood (30d)", value: avgMood },
          { label: "Most felt", value: topTag },
        ].map((s) => (
          <div key={s.label} className="card p-5 text-center">
            <div className="text-2xl font-black text-zinc-900 dark:text-white capitalize">{s.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT: input + feed */}
        <div className="flex-1 space-y-8">
          <div className="card p-8">
            <h2 className="text-xl font-extrabold mb-5 text-zinc-900 dark:text-white">How are you feeling?</h2>

            <div className="flex justify-between gap-2 mb-7">
              {moods.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMoodValue(m.value)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all cursor-pointer ${
                    moodValue === m.value
                      ? "bg-teal-50 dark:bg-teal-950/40 ring-2 ring-teal-400 scale-105"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 opacity-60 hover:opacity-100"
                  }`}
                >
                  <span className="text-3xl">{m.emoji}</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{m.label}</span>
                </button>
              ))}
            </div>

            <div className="mb-6">
              <div className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2.5">What's present? <span className="normal-case font-medium">(up to 4)</span></div>
              <div className="flex flex-wrap gap-2">
                {emotionTags.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTag(t)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      tags.includes(t)
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 scale-105"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <label className="block">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Sleep: <span className="text-teal-600 dark:text-teal-400">{sleep}h</span></span>
                <input type="range" min="0" max="12" step="0.5" value={sleep} onChange={(e) => setSleep(+e.target.value)} className="w-full mt-2 accent-teal-500" />
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Energy: <span className="text-teal-600 dark:text-teal-400">{"⚡".repeat(energy)}</span></span>
                <input type="range" min="1" max="5" value={energy} onChange={(e) => setEnergy(+e.target.value)} className="w-full mt-2 accent-teal-500" />
              </label>
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything on your mind? (optional)"
              className="w-full p-4 mb-4 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-teal-300 dark:focus:ring-teal-800 transition-all resize-none"
              rows="3"
            />
            <button onClick={handleSave} className="btn-primary w-full py-3.5">
              {saved ? "Saved ✓" : "Log check-in"}
            </button>
          </div>

          {/* Feed */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 ml-4">Recent check-ins</h3>
            {history.slice(0, 12).map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group card p-6 flex gap-4 relative"
              >
                <div className="text-4xl select-none">{entry.mood}</div>
                <div className="flex-1 pr-10">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-zinc-400">{entry.date}</span>
                    {entry.sleep !== undefined && <span className="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">😴 {entry.sleep}h</span>}
                    {(entry.tags || []).map((t) => (
                      <span key={t} className="text-[10px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                  {entry.note && <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed text-sm">{entry.note}</p>}
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="absolute top-5 right-5 text-rose-500 opacity-0 group-hover:opacity-100 transition-all font-bold text-xs bg-rose-50 dark:bg-rose-950/30 px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  Delete
                </button>
              </motion.div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-16 rounded-[2rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">No check-ins yet. Your first one is one tap away. ☝️</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: trend + calendar */}
        <aside className="lg:w-80 w-full space-y-6">
          <div className="card p-7 lg:sticky lg:top-28">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Mood trend · last 14</h4>
            <TrendChart entries={history} />

            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-8 mb-4">This month</h4>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                <div
                  key={day}
                  title={`Day ${day}`}
                  className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all select-none ${
                    loggedDays.has(day)
                      ? "bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-sm"
                      : day === new Date().getDate()
                      ? "ring-2 ring-teal-400 text-zinc-500"
                      : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800/60 dark:text-zinc-600"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] font-bold text-zinc-400">
              <span>Total check-ins</span>
              <span className="text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">{history.length}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
