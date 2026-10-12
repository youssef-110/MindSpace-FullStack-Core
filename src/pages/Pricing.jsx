import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { isProUser, setUserTier } from "../lib/storage";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState("annual");
  const [activePlan, setActivePlan] = useState(isProUser() ? "pro" : "free");
  const [msg, setMsg] = useState("");

  const upgrade = (plan) => {
    if (plan === "pro") {
      setUserTier("pro");
      setActivePlan("pro");
      setMsg("🎉 Congratulations! MindSpace Pro has been activated on your device.");
    } else {
      setUserTier("free");
      setActivePlan("free");
      setMsg("Switched back to Free Tier.");
    }
    setTimeout(() => setMsg(""), 3500);
  };

  const faqs = [
    {
      q: "What makes MindSpace Pro different from standard online tests?",
      a: "Standard online tests provide superficial scores. MindSpace Pro uses validated clinical instruments (TriPM, LSRP, SD3, PHQ-9, GAD-7) broken down into normative percentiles, granular subscales, and behavioral blindspots, coupled with Groq LLaMA-3.3-70B synthesis and printable PDF reports for your therapist.",
    },
    {
      q: "Is my assessment and chat data kept private?",
      a: "Yes. All journal entries, psychometric responses, and conversation histories are stored strictly in your browser's localStorage. MindSpace does not sell, mine, or monetize your personal health data.",
    },
    {
      q: "Can I bring my clinical report to my human therapist?",
      a: "Absolutely. In fact, that's what it was designed for. Pro members can generate a structured, formatted PDF summary that summarizes subscale scores, symptom chronologies, and behavioral themes to save you and your therapist hours of intake time.",
    },
    {
      q: "How does the AI Psychiatrist work?",
      a: "Dr. MindSpace utilizes Groq's high-speed inference engine paired with a specialized DSM-5-TR and CBT/DBT knowledge retrieval layer. It provides psychological psychoeducation, explores childhood schema origins, and offers evidence-based interventions without making dangerous off-label prescriptions.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-6">
      {/* Hero header */}
      <header className="text-center mb-14">
        <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 mb-4">
          Transparent, Fair Pricing
        </span>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-zinc-900 dark:text-white mb-4">
          Invest in Your Psychological Clarity
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
          Access clinical-grade psychometrics, unlimited conversations with Dr. MindSpace, and printable clinical reports.
        </p>

        {/* Billing toggle */}
        <div className="mt-8 inline-flex items-center gap-2 p-1.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              billingCycle === "monthly"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              billingCycle === "annual"
                ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Annual Billing
            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Save 36%</span>
          </button>
        </div>
      </header>

      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-center font-bold text-sm"
        >
          {msg}
        </motion.div>
      )}

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Free Plan */}
        <div className="card p-8 flex flex-col justify-between border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">Self-Care Basics</div>
            <h3 className="text-2xl font-bold mb-3">Free Explorer</h3>
            <div className="text-4xl font-black mb-4">$0 <span className="text-sm font-normal text-zinc-400">/ forever</span></div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              Standard wellness screeners, mood logs, and breathing tools for everyday mindfulness.
            </p>
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300 mb-8">
              <li className="flex items-center gap-2">✓ Standard assessments (PHQ-9, GAD-7, PSS-10)</li>
              <li className="flex items-center gap-2">✓ Summary scores and gentle advice</li>
              <li className="flex items-center gap-2">✓ 5 AI messages daily</li>
              <li className="flex items-center gap-2">✓ Offline interactive journal & breathing</li>
            </ul>
          </div>
          <button
            onClick={() => upgrade("free")}
            className="w-full py-3 rounded-full text-xs font-bold border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {activePlan === "free" ? "✓ Current Active Tier" : "Switch to Free"}
          </button>
        </div>

        {/* Pro Plan (Hero) */}
        <div className="card p-8 flex flex-col justify-between border-2 border-teal-500 bg-gradient-to-b from-teal-50/50 via-white to-indigo-50/30 dark:from-teal-950/40 dark:via-zinc-900 dark:to-indigo-950/30 shadow-2xl shadow-teal-500/10 relative">
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md">
            👑 Recommended
          </span>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-2">Clinical Grade</div>
            <h3 className="text-2xl font-bold mb-3">MindSpace Pro</h3>
            <div className="text-4xl font-black mb-4">
              {billingCycle === "annual" ? "$8.25" : "$12.99"}
              <span className="text-sm font-normal text-zinc-400"> / mo</span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              Complete clinical psychometric suite, forensic subscales, and unlimited AI Psychiatrist.
            </p>
            <ul className="space-y-3 text-sm text-zinc-700 dark:text-zinc-200 mb-8 font-medium">
              <li className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold">✓ Full Forensic Suite (TriPM, LSRP, SD3, NPI-16)</li>
              <li className="flex items-center gap-2">✓ Subscale percentiles & cognitive blindspots</li>
              <li className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">✓ Unlimited Groq LLaMA-3.3 70B & 8B streaming chat</li>
              <li className="flex items-center gap-2">✓ RAG Clinical Knowledge & Memory</li>
              <li className="flex items-center gap-2">✓ Printable PDF Reports formatted for therapists</li>
              <li className="flex items-center gap-2">✓ Big Five 30-item, Attachment Style, EQ-20 & MBTI</li>
            </ul>
          </div>
          <button
            onClick={() => upgrade("pro")}
            className="btn-primary w-full py-3.5 rounded-full text-sm font-bold tracking-wide shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
          >
            {activePlan === "pro" ? "✓ MindSpace Pro Active" : "Upgrade to Pro Now"}
          </button>
        </div>

        {/* Single Report Pass */}
        <div className="card p-8 flex flex-col justify-between border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-indigo-500 mb-2">Pay Per Report</div>
            <h3 className="text-2xl font-bold mb-3">Clinical Audit</h3>
            <div className="text-4xl font-black mb-4">$4.99 <span className="text-sm font-normal text-zinc-400">one-time</span></div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              Need a full clinical report for a single test? Unlock 10+ pages and PDF export instantly.
            </p>
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300 mb-8">
              <li className="flex items-center gap-2">✓ 1 Full Psychometric Clinical Report</li>
              <li className="flex items-center gap-2">✓ Complete subscale & facet breakdown</li>
              <li className="flex items-center gap-2">✓ High-resolution printable PDF export</li>
              <li className="flex items-center gap-2">✓ 24 hours of AI Psychiatrist consultation on this test</li>
            </ul>
          </div>
          <Link
            to="/tests"
            className="w-full py-3 rounded-full text-xs font-bold border border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all text-center block"
          >
            Browse Tests Catalog →
          </Link>
        </div>
      </div>

      {/* FAQ section */}
      <section className="mt-20">
        <h2 className="font-display text-3xl font-semibold text-center text-zinc-900 dark:text-white mb-10">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, i) => (
            <div key={i} className="card p-6 border border-zinc-200/80 dark:border-zinc-800">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-2">{faq.q}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ethical footnote */}
      <div className="mt-16 text-center text-xs text-zinc-400 max-w-xl mx-auto">
        MindSpace is a psychoeducational platform and self-care companion. It does not replace psychiatric evaluation or crisis care. If you are experiencing a crisis, please call 988.
      </div>
    </div>
  );
}
