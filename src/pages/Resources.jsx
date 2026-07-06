import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { crisisResources } from "../lib/safety";

const supportPaths = [
  { icon: "🧑‍⚕️", title: "Find a therapist", desc: "Psychology Today's directory, your insurance provider list, or your doctor are the usual starting points. Sliding-scale and training clinics exist for tight budgets." },
  { icon: "🏫", title: "Students", desc: "Nearly every university has free counseling services — they are confidential and separate from your academic record." },
  { icon: "💼", title: "At work", desc: "Many employers offer an Employee Assistance Program (EAP): a handful of free, confidential therapy sessions. HR can tell you without asking why." },
  { icon: "📱", title: "Teletherapy", desc: "Online therapy platforms make it possible to talk to a licensed therapist from home, often within days." },
  { icon: "👥", title: "Support groups", desc: "NAMI (nami.org) and local community centers run free peer support groups for depression, anxiety, grief, and more." },
  { icon: "🆘", title: "Warmlines", desc: "Not in crisis but need to talk? 'Warmlines' are peer-staffed listening lines — search 'warmline' plus your region." },
];

export default function Resources() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="text-center mb-12">
        <div className="text-5xl mb-4">💗</div>
        <h1 className="font-display text-5xl font-semibold text-zinc-900 dark:text-white mb-3">Get support</h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          Reaching out is not weakness — it's one of the bravest, most effective things a person can do.
        </p>
      </header>

      {/* Crisis block */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/15 mb-12"
      >
        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white mb-1">In crisis right now?</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          If you're thinking about harming yourself or feel unsafe, please contact one of these now. They exist exactly for this moment.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {crisisResources.map((r) => (
            <div key={r.name} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-rose-900/50">
              <div className="font-bold text-sm text-zinc-900 dark:text-white">{r.name}</div>
              <div className="text-rose-600 dark:text-rose-300 font-extrabold text-lg my-1">{r.contact}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">{r.note}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Non-crisis paths */}
      <section className="mb-14">
        <h2 className="font-display text-3xl font-semibold text-zinc-900 dark:text-white text-center mb-8">Everyday paths to support</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {supportPaths.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="card p-6"
            >
              <div className="text-3xl mb-3">{p.icon}</div>
              <h3 className="font-extrabold text-zinc-900 dark:text-white mb-1.5">{p.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">While you're here, MindSpace's tools can help you through this moment:</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/breathe" className="btn-primary px-6 py-3 text-sm">🌬️ Breathe with me</Link>
          <Link to="/journal" className="btn-ghost px-6 py-3 text-sm text-zinc-700 dark:text-zinc-200">📓 Write it out</Link>
          <Link to="/ai" className="btn-ghost px-6 py-3 text-sm text-zinc-700 dark:text-zinc-200">✨ Talk to the Companion</Link>
        </div>
      </div>
    </div>
  );
}
