import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { assessments, scoreAssessment } from "../lib/assessments";
import { load, appendToList, isProUser, isReportUnlocked } from "../lib/storage";
import CrisisModal from "../components/CrisisModal";
import PricingModal from "../components/PricingModal";

const toneStyles = {
  good: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300",
  ok: "bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900 text-teal-700 dark:text-teal-300",
  warn: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300",
  alert: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300",
};

export default function Tests() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all"); // 'all' | 'clinical' | 'personality' | 'wellness'
  const [active, setActive] = useState(null); // assessment being taken
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [showCrisis, setShowCrisis] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const historyAll = load("assessmentResults", []);
  const isPro = isProUser();

  const filteredAssessments = assessments.filter((a) => {
    if (filter === "all") return true;
    return a.category === filter;
  });

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

      let summaryScore = res.score ?? res.overallPercent ?? null;
      let summaryMax = res.maxScore ?? (res.overallPercent !== undefined ? 100 : null);
      let summaryLevel = res.band?.level ?? (res.archetypeCode ? res.archetypeCode : "Multi-facet");

      appendToList("assessmentResults", {
        id: active.id,
        name: active.name,
        date: new Date().toISOString(),
        score: summaryScore,
        maxScore: summaryMax,
        level: summaryLevel,
        facets: res.facets || null,
        archetypeCode: res.archetypeCode || null,
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

  const discussWithAI = () => {
    if (!active || !result) return;
    let params = new URLSearchParams();
    params.set("testId", active.id);
    params.set("testName", active.name);

    if (result.type === "subscales" && result.facets) {
      const facetData = result.facets.map((f) => `${f.name}: ${f.percent}% (${f.tier})`).join("; ");
      params.set("facets", facetData);
      params.set("score", result.overallPercent);
    } else if (result.type === "archetypes") {
      params.set("archetype", result.archetypeCode);
      params.set("title", result.title);
      params.set("score", result.archetypeCode);
    } else if (result.type === "personality") {
      const traitData = result.traits.map((t) => `${t.trait}: ${t.percent}%`).join("; ");
      params.set("facets", traitData);
      params.set("score", "BigFive");
    } else {
      params.set("score", `${result.score}/${result.maxScore}`);
      params.set("level", result.band?.level || "Evaluated");
    }

    navigate(`/ai?${params.toString()}`);
  };

  const printReport = () => {
    window.print();
  };

  /* ---------- Library view ---------- */
  if (!active) {
    return (
      <div className="max-w-6xl mx-auto">
        <CrisisModal open={showCrisis} onClose={() => setShowCrisis(false)} />
        <PricingModal open={showPricing} onClose={() => setShowPricing(false)} />

        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase bg-gradient-to-r from-indigo-500/10 via-teal-500/10 to-rose-500/10 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 mb-4">
            🔬 Dual Psychometric & Clinical Engine
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-zinc-900 dark:text-white mb-4">
            Know your mind
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Clinically validated psychiatric screeners, forensic personality models, and pop-psychology self-discovery instruments.
          </p>

          {/* Category Filter Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {[
              { id: "all", label: "All Instruments", count: assessments.length },
              { id: "clinical", label: "Clinical & Forensic", count: assessments.filter(a => a.category === "clinical").length },
              { id: "personality", label: "Personality & Growth", count: assessments.filter(a => a.category === "personality").length },
              { id: "wellness", label: "Mood & Anxiety", count: assessments.filter(a => a.category === "wellness").length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filter === tab.id
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filter === tab.id ? "bg-white/20 dark:bg-zinc-900/20" : "bg-zinc-200 dark:bg-zinc-700"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </header>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.map((a, i) => (
            <motion.button
              key={a.id}
              onClick={() => start(a)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card card-hover p-7 text-left cursor-pointer group flex flex-col justify-between border border-zinc-200/80 dark:border-zinc-800/80 relative overflow-hidden"
            >
              {a.isPro && (
                <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-teal-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  👑 Pro
                </div>
              )}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                    {a.icon}
                  </div>
                  {!a.isPro && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full">
                      {a.subtitle} · ~{a.minutes} min
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-extrabold mb-1.5 text-zinc-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {a.name}
                </h3>
                <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-2">
                  {a.subtitle}
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                  {a.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400">
                  {a.questions.length} questions
                </span>
                <span className="text-sm font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Begin check-in →
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* History section */}
        {historyAll.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Your past clinical check-ins</h2>
              <span className="text-xs text-zinc-400">{historyAll.length} recorded</span>
            </div>
            <div className="card divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
              {historyAll.slice(0, 6).map((h, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                  <div>
                    <div className="font-bold text-sm text-zinc-800 dark:text-zinc-200">{h.name}</div>
                    <div className="text-xs text-zinc-400">{new Date(h.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</div>
                  </div>
                  <div className="text-right">
                    {h.score !== null && (
                      <div className="font-black text-zinc-900 dark:text-white">
                        {h.score}
                        {h.maxScore && <span className="text-zinc-400 text-xs font-bold"> / {h.maxScore}</span>}
                      </div>
                    )}
                    <div className="text-xs font-bold text-teal-600 dark:text-teal-400">{h.level}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-14 p-6 rounded-3xl bg-zinc-100/60 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-center max-w-2xl mx-auto">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            <strong className="text-zinc-700 dark:text-zinc-300">Clinical Disclaimer:</strong> All assessments are evidence-based psychoeducational screeners and personality models. They are not medical diagnostic tools. If a result causes distress, please share it with a licensed mental health professional or use the Resources page for immediate crisis care.
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Result view ---------- */
  if (result) {
    const isUnlocked = isPro || isReportUnlocked(active.id);

    return (
      <div className="max-w-3xl mx-auto">
        <CrisisModal open={showCrisis} onClose={() => setShowCrisis(false)} />
        <PricingModal open={showPricing} onClose={() => setShowPricing(false)} targetReportId={active.id} />

        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 sm:p-10 text-center print:shadow-none print:border-none">
          {/* Header */}
          <div className="text-5xl mb-3">{active.icon}</div>
          <span className="text-xs font-black uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-1 block">
            Psychometric Clinical Synthesis
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-zinc-900 dark:text-white mb-2">
            {active.name}
          </h2>
          <p className="text-xs text-zinc-400 mb-8">{active.subtitle} · Completed {new Date().toLocaleDateString()}</p>

          {/* A. MULTI-SUBSCALE ASSESSMENTS (TriPM, LSRP, SD3, OCEAN-30, Attachment, EQ-20, NPI-16) */}
          {result.type === "subscales" && (
            <div className="mb-10 text-left space-y-6">
              {/* Overall Profile Summary */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Overall Trait Intensity</div>
                  <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{result.summary}</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-zinc-900 dark:text-white">{result.overallPercent}%</div>
                  <div className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase">Composite Percentile</div>
                </div>
              </div>

              {/* Subscale Progress Bars */}
              <div className="space-y-4">
                {result.facets.map((facet, i) => (
                  <div key={facet.name} className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800">
                    <div className="flex justify-between items-center text-sm font-bold mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: facet.color }} />
                        <span className="text-zinc-800 dark:text-zinc-200">{facet.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {facet.tier}
                        </span>
                        <span className="text-teal-600 dark:text-teal-400 font-black">{facet.percent}%</span>
                      </div>
                    </div>
                    <div className="h-3 rounded-full bg-zinc-200/60 dark:bg-zinc-800 overflow-hidden my-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${facet.percent}%` }}
                        transition={{ duration: 1, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: facet.color }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1">
                      {facet.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pro Blurred Paywall Section */}
              <div className="relative mt-8 rounded-3xl overflow-hidden">
                <div className={`p-6 rounded-3xl bg-zinc-100/50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 transition-all ${!isUnlocked ? "filter blur-sm select-none pointer-events-none" : ""}`}>
                  <div className="flex items-center gap-2 text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mb-3">
                    <span>📑</span> Clinical Interpretation & Cognitive Blindspots (Pro Report)
                  </div>
                  <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    <p>
                      <strong>Psychological Dynamics:</strong> Based on the statistical alignment of your {active.subtitle} subscales, your profile demonstrates significant variance between dominant traits and regulatory controls. In clinical settings, elevations in these dimensions correlate with distinct behavioral schemas during interpersonal stress.
                    </p>
                    <p>
                      <strong>Potential Cognitive Blindspots:</strong> Watch for over-reliance on primary affective defenses when facing ambiguous social evaluations. High scores may prompt pre-emptive emotional distancing, while lower scores might increase vulnerability to boundary violations.
                    </p>
                    <p>
                      <strong>Recommended Interventions:</strong> Dialectical Behavior Therapy (DBT) distress tolerance principles, Acceptance and Commitment Therapy (ACT) values defusion, and structured cognitive journaling.
                    </p>
                  </div>
                </div>

                {!isUnlocked && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-900/40 backdrop-blur-md p-6 text-center rounded-3xl">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-teal-500 flex items-center justify-center text-white text-xl shadow-lg mb-3">
                      🔒
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      Unlock Full Clinical Report & Blindspots
                    </h3>
                    <p className="text-xs text-zinc-200 max-w-sm mb-4">
                      Pro members receive the complete 10+ page forensic breakdown, therapist-ready PDF exports, and unlimited AI Psychiatrist analysis.
                    </p>
                    <button
                      onClick={() => setShowPricing(true)}
                      className="btn-primary py-2.5 px-6 text-xs font-bold shadow-xl shadow-teal-500/25 cursor-pointer"
                    >
                      👑 Unlock with MindSpace Pro ($12.99/mo)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* B. ARCHETYPES (16 Cognitive Archetypes) */}
          {result.type === "archetypes" && (
            <div className="mb-10 text-left space-y-6">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-teal-500/10 border border-purple-500/20 text-center">
                <div className="text-xs font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-1">
                  Your Cognitive Archetype
                </div>
                <div className="text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">
                  {result.archetypeCode}
                </div>
                <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 mb-2">{result.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-md mx-auto leading-relaxed">{result.blurb}</p>
              </div>

              <div className="space-y-3">
                {result.dimensions.map((dim) => (
                  <div key={dim.name} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-zinc-700 dark:text-zinc-300">{dim.name}</span>
                      <span className="text-teal-600 dark:text-teal-400 font-extrabold">{dim.chosen} ({dim.percent}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${dim.percent}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-teal-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* C. TIPI PERSONALITY (Big Five Snapshot) */}
          {result.type === "personality" && (
            <div className="space-y-4 text-left mb-8">
              {result.traits.map((t, i) => (
                <div key={t.trait} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between text-sm font-bold mb-1">
                    <span className="text-zinc-800 dark:text-zinc-200">{t.trait}</span>
                    <span className="text-teal-600 dark:text-teal-400">{t.percent}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${t.percent}%` }}
                      transition={{ duration: 0.9, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-teal-400 to-indigo-500"
                    />
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{t.blurb}</p>
                </div>
              ))}
            </div>
          )}

          {/* D. UNIDIMENSIONAL WELLNESS SCREENERS (PHQ-9, GAD-7, PSS-10, WHO-5, ASRS, OCI-R) */}
          {!result.type && (
            <>
              <div className="relative inline-flex items-center justify-center mb-6">
                <svg width="170" height="170" viewBox="0 0 170 170" role="img" aria-label={`Score ${result.score} of ${result.maxScore}`}>
                  <circle cx="85" cy="85" r="70" fill="none" strokeWidth="14" className="stroke-zinc-100 dark:stroke-zinc-800" />
                  <motion.circle
                    cx="85" cy="85" r="70" fill="none" strokeWidth="14" strokeLinecap="round"
                    className="stroke-teal-500"
                    strokeDasharray={2 * Math.PI * 70}
                    initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - result.score / result.maxScore) }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    transform="rotate(-90 85 85)"
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
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed mb-8 max-w-lg mx-auto text-sm sm:text-base">
                {result.band.advice}
              </p>
            </>
          )}

          {/* ACTION BUTTONS & DIRECT AI INTEGRATION */}
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap justify-center gap-3">
            <button
              onClick={discussWithAI}
              className="btn-primary px-6 py-3 shadow-lg shadow-teal-500/20 flex items-center gap-2 font-bold cursor-pointer"
            >
              <span>🧠</span> Discuss These Results with AI Psychiatrist
            </button>
            {isUnlocked && (
              <button
                onClick={printReport}
                className="btn-ghost px-5 py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <span>📄</span> Export Clinical Report (PDF)
              </button>
            )}
            <button onClick={() => start(active)} className="btn-ghost px-5 py-3 text-zinc-700 dark:text-zinc-200">
              Retake
            </button>
            <button onClick={reset} className="btn-ghost px-5 py-3 text-zinc-700 dark:text-zinc-200">
              ← All tests
            </button>
          </div>

          <p className="text-[11px] text-zinc-400 mt-6">
            For psychoeducational screening only; does not replace formal clinical assessment or psychiatric diagnosis.
          </p>
        </motion.div>
      </div>
    );
  }

  /* ---------- Question view ---------- */
  const progress = (qIndex / active.questions.length) * 100;
  return (
    <div className="max-w-xl mx-auto">
      <button onClick={reset} className="text-sm font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 mb-6 ml-1 transition-colors cursor-pointer">
        ← Exit Check-in
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
