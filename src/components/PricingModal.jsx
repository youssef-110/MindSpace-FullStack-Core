import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { setUserTier, getUserTier, unlockReport } from "../lib/storage";

export default function PricingModal({ open, onClose, targetReportId = null, initialPlan = "pro" }) {
  const [billingCycle, setBillingCycle] = useState("annual"); // 'monthly' | 'annual'
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const currentTier = getUserTier();

  if (!open) return null;

  const handleCheckout = (type) => {
    setProcessing(true);
    setTimeout(() => {
      if (type === "single" && targetReportId) {
        unlockReport(targetReportId);
        setSuccessMsg(`Single Clinical Audit unlocked for report #${targetReportId}!`);
      } else {
        setUserTier("pro");
        setSuccessMsg("Welcome to MindSpace Pro! All clinical features are now unlocked.");
      }
      setProcessing(false);
      setTimeout(() => {
        setSuccessMsg(null);
        if (onClose) onClose();
      }, 1400);
    }, 900);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-white dark:bg-[#0e0e14] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 my-8 overflow-hidden text-zinc-900 dark:text-zinc-100"
        >
          {/* Subtle gradient glow decoration */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-indigo-500/20 via-teal-400/20 to-rose-400/20 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-teal-500/20 to-indigo-500/20 blur-3xl pointer-events-none rounded-full" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer text-sm font-bold"
            aria-label="Close"
          >
            ✕
          </button>

          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-gradient-to-r from-teal-500/10 to-indigo-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 mb-3">
              👑 MindSpace Clinical & Pro Tiers
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              Unlock Deep Forensic Insights & Unlimited AI
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
              Designed for psychometric enthusiasts, psychology students, and clinicians.
              Access granular TriPM subscales, Dark Triad percentiles, therapist PDF exports, and Groq-powered clinical reasoning.
            </p>

            {/* Billing Toggle */}
            <div className="mt-5 inline-flex items-center gap-2 p-1 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Monthly ($12.99)
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                  billingCycle === "annual"
                    ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Annual ($99/yr)
                <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider">Save 36%</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-center font-bold text-sm"
            >
              🎉 {successMsg}
            </motion.div>
          )}

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Free Tier */}
            <div className="card p-6 flex flex-col justify-between border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-1">Explorer</div>
                <h3 className="text-xl font-bold mb-2">Free Tier</h3>
                <div className="text-3xl font-black mb-4">$0 <span className="text-xs text-zinc-400 font-normal">/ month</span></div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
                  Essential wellness screeners and mood tracking for everyday self-care.
                </p>
                <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300 mb-6">
                  <li className="flex items-center gap-2">✓ All basic screeners (PHQ-9, GAD-7, PSS-10)</li>
                  <li className="flex items-center gap-2">✓ High-level summary score & advice</li>
                  <li className="flex items-center gap-2">✓ 5 AI Assistant messages daily</li>
                  <li className="flex items-center gap-2">✓ Local mood tracker & breathing exercises</li>
                  <li className="flex items-center gap-2 text-zinc-400 dark:text-zinc-600 line-through">✗ Detailed clinical facet percentiles</li>
                  <li className="flex items-center gap-2 text-zinc-400 dark:text-zinc-600 line-through">✗ Printable Clinical PDF Reports</li>
                </ul>
              </div>
              <button
                disabled
                className="w-full py-2.5 rounded-full text-xs font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-500 cursor-default text-center"
              >
                {currentTier === "free" ? "Current Tier" : "Default"}
              </button>
            </div>

            {/* MindSpace Pro (Featured) */}
            <div className="card p-6 flex flex-col justify-between border-2 border-teal-500 dark:border-teal-400 bg-gradient-to-b from-teal-50/40 via-white to-indigo-50/20 dark:from-teal-950/30 dark:via-zinc-900 dark:to-indigo-950/20 shadow-xl shadow-teal-500/10 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-md">
                ⭐ Most Popular
              </span>
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">Clinical Grade</div>
                <h3 className="text-xl font-bold mb-2">MindSpace Pro</h3>
                <div className="text-3xl font-black mb-4">
                  {billingCycle === "annual" ? "$8.25" : "$12.99"}
                  <span className="text-xs text-zinc-400 font-normal"> / mo {billingCycle === "annual" && "(billed $99/yr)"}</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
                  Complete psychiatric self-assessment suite with RAG clinical agent & PDF exports.
                </p>
                <ul className="space-y-2.5 text-xs text-zinc-700 dark:text-zinc-200 mb-6 font-medium">
                  <li className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold">✓ 10+ Page In-Depth Psychometric Reports</li>
                  <li className="flex items-center gap-2">✓ Full TriPM Psychopathy & LSRP Sociopathy subscales</li>
                  <li className="flex items-center gap-2">✓ Dark Triad (SD3) & Narcissism (NPI-16) percentiles</li>
                  <li className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">✓ Unlimited AI Psychiatrist conversations</li>
                  <li className="flex items-center gap-2">✓ High-speed Groq LLaMA-3.3 70B & 8B streaming</li>
                  <li className="flex items-center gap-2">✓ Printable Clinical PDF Reports for your therapist</li>
                </ul>
              </div>
              <button
                onClick={() => handleCheckout("pro")}
                disabled={processing || currentTier === "pro"}
                className="btn-primary w-full py-3 rounded-full text-xs font-bold tracking-wide shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                {processing ? "Activating Pro…" : currentTier === "pro" ? "✓ Pro Active" : "Upgrade to Pro"}
              </button>
            </div>

            {/* One-Time Deep Audit */}
            <div className="card p-6 flex flex-col justify-between border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-indigo-500 mb-1">Single Access</div>
                <h3 className="text-xl font-bold mb-2">Deep Audit</h3>
                <div className="text-3xl font-black mb-4">$4.99 <span className="text-xs text-zinc-400 font-normal">one-time</span></div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
                  Unlock the full clinical report and therapist export for any single assessment.
                </p>
                <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300 mb-6">
                  <li className="flex items-center gap-2">✓ Full forensic report for 1 assessment</li>
                  <li className="flex items-center gap-2">✓ Subscale percentiles & blindspots</li>
                  <li className="flex items-center gap-2">✓ 1-click PDF export to bring to therapy</li>
                  <li className="flex items-center gap-2">✓ 24 hours of AI consultation on this test</li>
                  <li className="flex items-center gap-2 text-zinc-400 dark:text-zinc-600">✗ Does not include all catalog tests</li>
                </ul>
              </div>
              <button
                onClick={() => handleCheckout("single")}
                disabled={processing}
                className="w-full py-2.5 rounded-full text-xs font-bold border border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-center cursor-pointer"
              >
                {processing ? "Unlocking…" : "Unlock Single ($4.99)"}
              </button>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center text-[11px] text-zinc-400 leading-normal">
            MindSpace reports are psychoeducational instruments backed by peer-reviewed psychological literature.
            They are designed to facilitate productive conversations with human mental health professionals. Cancel anytime.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
