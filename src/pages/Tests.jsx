import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { assessments, scoreAssessment } from "../lib/assessments";
import { load, appendToList } from "../lib/storage";
import CrisisModal from "../components/CrisisModal";

const toneStyles = {
  good: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300",
  ok: "bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900 text-teal-700 dark:text-teal-300",
  warn: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300",
  alert: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300",
};

export default function Tests() {
  const [active, setActive] = useState(null); // assessment being taken
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [showCrisis, setShowCrisis] = useState(false);
  const historyAll = load("assessmentResults", []);

  const start = (a) => {
    setActive(a);
    setQIndex(0);
    setAnswers([]);
    setResult(null);
  };

  const answer = (value) => {
    const next = [...answers, value];
    setAnswers(next);
    if (qIndex + 1 < active.questions.length) {
      setQIndex(qIndex + 1);
    } else {
      const res = scoreAssessment(active, next);
      setResult(res);
      appendToList("assessmentResults", {
        id: active.id,
        name: active.name,
        date: new Date().toISOString(),
        score: res.score ?? null,
        maxScore: res.maxScore ?? null,
        level: res.band?.level ?? "Personality",
      });
      if (res.riskFlag) setShowCrisis(true);
    }
  };

  const reset = () => {
    setActive(null);
    setResult(null);
    setAnswers([]);
    setQIndex(0);
  };

  /* ---------- Library view ---------- */
  if (!active) {
    return (
      <div className="max-w-5xl mx-auto">
        <CrisisModal open={showCrisis} onClose={() => setShowCrisis(false)} />
        <header className="text-center mb-12">
          <h1 className="font-display text-5xl md:text-6xl font-semibold text-zinc-900 dark:text-white mb-4">Know yourself</h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            The same validated screeners clinicians use — private, instant, and interpreted in plain language.
            These are check-ins, not diagnoses.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {assessments.map((a, i) => (
            <motion.button
              key={a.id}
              onClick={() => start(a)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card card-hover p-7 text-left cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                  {a.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                  {a.subtitle} · ~{a.minutes} min
                </span>
              </div>
              <h3 className="text-xl font-extrabold mb-2 text-zinc-900 dark:text-white">{a.name}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{a.description}</p>
              <span className="inline-block mt-4 text-sm font-bold text-teal-600 dark:text-teal-400">
                {a.questions.length} questions →
              </span>
            </motion.button>
          ))}
        </div>

        {historyAll.length > 0 && (
          <section className="mt-14">
            <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 ml-2">Your past check-ins</h2>
            <div className="card divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
              {historyAll.slice(0, 8).map((h, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <div className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{h.name}</div>
                    <div className="text-xs text-zinc-400">{new Date(h.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</div>
                  </div>
                  <div className="text-right">
                    {h.score !== null && <div className="font-black text-zinc-900 dark:text-white">{h.score}<span className="text-zinc-400 text-xs font-bold"> / {h.maxScore}</span></div>}
                    <div className="text-xs font-bold text-teal-600 dark:text-teal-400">{h.level}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center mt-10 max-w-lg mx-auto">
          These screeners can't diagnose a condition. If a result worries you, please share it with a
          doctor or mental health professional — that's exactly what these tools were designed for.
        </p>
      </div>
    );
  }

  /* ---------- Result view ---------- */
  if (result) {
    return (
      <div className="max-w-xl mx-auto">
        <CrisisModal open={showCrisis} onClose={() => setShowCrisis(false)} />
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="card p-10 text-center">
          <div className="text-5xl mb-4">{active.icon}</div>
          <h2 className="font-display text-3xl font-semibold text-zinc-900 dark:text-white mb-6">{active.name}</h2>

          {result.type === "personality" ? (
            <div className="space-y-5 text-left mb-8">
              {result.traits.map((t, i) => (
                <div key={t.trait}>
                  <div className="flex justify-between text-sm font-bold mb-1.5">
                    <span className="text-zinc-800 dark:text-zinc-200">{t.trait}</span>
                    <span className="text-teal-600 dark:text-teal-400">{t.percent}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${t.percent}%` }}
                      transition={{ duration: 0.9, delay: 0.2 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-teal-400 to-indigo-500"
                    />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">{t.blurb}</p>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="relative inline-flex items-center justify-center mb-6">
                <svg width="160" height="160" viewBox="0 0 160 160" role="img" aria-label={`Score ${result.score} of ${result.maxScore}`}>
                  <circle cx="80" cy="80" r="66" fill="none" strokeWidth="14" className="stroke-zinc-100 dark:stroke-zinc-800" />
                  <motion.circle
                    cx="80" cy="80" r="66" fill="none" strokeWidth="14" strokeLinecap="round"
                    className="stroke-teal-500"
                    strokeDasharray={2 * Math.PI * 66}
                    initial={{ strokeDashoffset: 2 * Math.PI * 66 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 66 * (1 - result.score / result.maxScore) }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    transform="rotate(-90 80 80)"
                  />
                </svg>
                <div className="absolute text-center">
                  <div className="text-4xl font-black text-zinc-900 dark:text-white">{result.score}</div>
                  <div className="text-xs font-bold text-zinc-400">of {result.maxScore}</div>
                </div>
              </div>

              <div className={`inline-block px-4 py-1.5 rounded-full border text-sm font-extrabold mb-5 ${toneStyles[result.band.tone]}`}>
                {result.band.level}
              </div>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-8">{result.band.advice}</p>
            </>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={reset} className="btn-ghost px-6 py-3 text-zinc-700 dark:text-zinc-200">← All assessments</button>
            <button onClick={() => start(active)} className="btn-primary px-6 py-3">Retake</button>
            <Link to="/ai" className="btn-ghost px-6 py-3 text-zinc-700 dark:text-zinc-200">Talk it through ✨</Link>
          </div>
          <p className="text-[11px] text-zinc-400 mt-6">Screening tool only — not a diagnosis.</p>
        </motion.div>
      </div>
    );
  }

  /* ---------- Question view ---------- */
  const progress = (qIndex / active.questions.length) * 100;
  return (
    <div className="max-w-xl mx-auto">
      <button onClick={reset} className="text-sm font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 mb-6 ml-1 transition-colors cursor-pointer">
        ← Exit
      </button>
      <div className="card p-8 md:p-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black tracking-widest uppercase text-zinc-400">
            {active.name} · {qIndex + 1} / {active.questions.length}
          </span>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mb-8">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-400 to-indigo-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-2 font-medium">{active.intro}</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-2xl font-extrabold mb-8 text-zinc-900 dark:text-white leading-snug">
              {active.questions[qIndex]}
            </h2>
            <div className="flex flex-col gap-3">
              {active.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => answer(opt.value)}
                  className="w-full text-left px-6 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 text-zinc-800 dark:text-zinc-200 font-medium transition-all cursor-pointer active:scale-[0.99]"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
