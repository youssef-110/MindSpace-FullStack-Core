import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { load } from "../lib/storage";

const affirmations = [
  "You don't have to feel better to begin — beginning is how you feel better.",
  "Feelings are visitors. Let them come and go.",
  "Rest is productive. Your worth isn't measured in output.",
  "You've survived 100% of your hardest days so far.",
  "Small steps still move you forward.",
  "It's okay to not be okay — and it's okay to ask for help.",
  "You are allowed to take up space and time.",
  "Progress isn't linear, and that's perfectly normal.",
  "Be as kind to yourself as you would be to a friend.",
  "This moment is heavy, not permanent.",
  "Noticing how you feel is already an act of care.",
  "You can do hard things — slowly, gently, one at a time.",
  "Your thoughts are not facts.",
  "Healing happens in ordinary moments, not grand gestures.",
];

const features = [
  { icon: "📈", title: "Mood Tracker", desc: "Log moods, sleep, and energy. Watch your patterns emerge with gentle charts and streaks.", path: "/tracker", color: "from-teal-400/20 to-emerald-400/20" },
  { icon: "📓", title: "Guided Journal", desc: "CBT-informed prompts, gratitude practice, and thought records to untangle heavy thinking.", path: "/journal", color: "from-amber-400/20 to-orange-400/20" },
  { icon: "🌬️", title: "Breathe & Ground", desc: "Animated breathing exercises and the 5-4-3-2-1 grounding technique for anxious moments.", path: "/breathe", color: "from-sky-400/20 to-cyan-400/20" },
  { icon: "🧠", title: "Self-Assessments", desc: "Clinically validated screeners — PHQ-9, GAD-7, stress, wellbeing, and a Big Five snapshot.", path: "/tests", color: "from-indigo-400/20 to-blue-400/20" },
  { icon: "📚", title: "Learn", desc: "Bite-sized, evidence-based psychoeducation on anxiety, depression, sleep, and burnout.", path: "/learn", color: "from-fuchsia-400/20 to-purple-400/20" },
  { icon: "✨", title: "AI Companion", desc: "A warm, psychology-grounded companion to talk things through — anytime, judgment-free.", path: "/ai", color: "from-rose-400/20 to-pink-400/20" },
];

const steps = [
  { n: "01", t: "Check in", d: "Take 60 seconds to log how you actually feel — no filters needed here." },
  { n: "02", t: "Understand", d: "Assessments and charts turn vague feelings into patterns you can see." },
  { n: "03", t: "Practice", d: "Breathe, journal, and learn skills drawn from CBT and mindfulness research." },
  { n: "04", t: "Grow", d: "Small daily reps compound. Watch your baseline shift over weeks, not hours." },
];

// Rotates once per day; computed at module load so render stays pure.
const affirmation = affirmations[Math.floor(Date.now() / 86400000) % affirmations.length];

export default function Home() {
  const [moodCount] = useState(() => load("localMoods", []).length);
  const [journalCount] = useState(() => load("journal", []).length);

  return (
    <div className="relative">
      {/* Aurora background */}
      <div className="aurora w-[34rem] h-[34rem] bg-teal-300/60 dark:bg-teal-600/25 -top-32 -left-24" />
      <div className="aurora w-[28rem] h-[28rem] bg-indigo-300/60 dark:bg-indigo-600/25 top-24 right-0" style={{ animationDelay: "-6s" }} />
      <div className="aurora w-[24rem] h-[24rem] bg-rose-200/60 dark:bg-fuchsia-700/20 top-[28rem] left-1/3" style={{ animationDelay: "-12s" }} />

      {/* Hero */}
      <section className="relative text-center pt-16 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300 mb-8 backdrop-blur"
        >
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          Private by design — your data stays with you
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="font-display text-6xl md:text-8xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-6"
        >
          Your mind deserves
          <br />
          <span className="text-gradient italic">a space</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed"
        >
          A gentle, science-backed companion for the days you're thriving and the days
          you're just surviving. Track, reflect, breathe, and understand yourself better.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-10"
        >
          <Link to="/tracker" className="btn-primary px-8 py-4 text-base">Start a check-in →</Link>
          <Link to="/ai" className="btn-ghost px-8 py-4 text-base text-zinc-700 dark:text-zinc-200">Talk to the Companion</Link>
        </motion.div>

        {/* Daily affirmation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-14 max-w-xl mx-auto"
        >
          <div className="card p-6 text-left flex items-start gap-4">
            <div className="text-2xl animate-float">🕊️</div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-1">Today's reminder</div>
              <p className="font-display italic text-lg text-zinc-800 dark:text-zinc-200">"{affirmation}"</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature grid */}
      <section className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.path + f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <Link to={f.path} className={`card card-hover block p-8 h-full relative overflow-hidden group`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="text-4xl mb-5 group-hover:scale-110 transition-transform duration-300 origin-left">{f.icon}</div>
                  <h3 className="text-xl font-extrabold mb-2 text-zinc-900 dark:text-zinc-100">{f.title}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm">{f.desc}</p>
                  <span className="inline-block mt-4 text-sm font-bold text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">Explore →</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Your journey so far */}
      {(moodCount > 0 || journalCount > 0) && (
        <section className="relative max-w-3xl mx-auto mt-16">
          <div className="card p-8 flex flex-wrap items-center justify-around gap-6 text-center">
            <div>
              <div className="text-4xl font-black text-teal-600 dark:text-teal-400">{moodCount}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">moods logged</div>
            </div>
            <div>
              <div className="text-4xl font-black text-indigo-500 dark:text-indigo-400">{journalCount}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">journal entries</div>
            </div>
            <p className="w-full text-sm text-zinc-500 dark:text-zinc-400">Every entry is a rep for your mental fitness. Keep going. 🌱</p>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="relative max-w-5xl mx-auto mt-24 mb-8">
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-center text-zinc-900 dark:text-white mb-3">
          Gentle by design
        </h2>
        <p className="text-center text-zinc-500 dark:text-zinc-400 mb-12 max-w-xl mx-auto">
          Built on cognitive-behavioral and mindfulness research — designed for real humans on hard days.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card p-7"
            >
              <div className="font-display text-3xl text-teal-500/60 dark:text-teal-400/50 mb-3">{s.n}</div>
              <h3 className="font-extrabold text-lg mb-2 text-zinc-900 dark:text-zinc-100">{s.t}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Safety note */}
      <section className="relative max-w-3xl mx-auto mt-16">
        <div className="card p-8 border-rose-100 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/10 text-center">
          <div className="text-3xl mb-3">💗</div>
          <h3 className="font-extrabold text-lg mb-2 text-zinc-900 dark:text-zinc-100">In a dark place right now?</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-5 max-w-md mx-auto">
            You deserve immediate, human support. Crisis lines are free, confidential, and available 24/7.
          </p>
          <Link to="/resources" className="inline-block px-6 py-3 rounded-full bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/30 hover:scale-105 transition-transform">
            See crisis resources
          </Link>
        </div>
      </section>
    </div>
  );
}
