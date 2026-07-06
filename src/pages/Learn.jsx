import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const articles = [
  {
    id: "anxiety",
    icon: "🌪️",
    title: "Understanding anxiety",
    tag: "Anxiety",
    read: 3,
    sections: [
      ["What it is", "Anxiety is your brain's smoke alarm — a survival system that predicts threats. The system isn't broken when it fires too often; it's over-calibrated. That distinction matters: you're not defective, your alarm is just sensitive."],
      ["The body loop", "Anxiety lives in the body as much as the mind: racing heart, tight chest, shallow breath. The brain reads those sensations as evidence of danger, which creates more anxiety — a loop. Slow exhales (try the Breathe page) interrupt the loop at the body level."],
      ["What helps", "Evidence-based tools: slow breathing, gradual exposure to feared situations (avoidance feeds anxiety), limiting caffeine, regular movement, and CBT — the gold-standard therapy. If anxiety limits your life, a professional can help; it's among the most treatable conditions."],
    ],
  },
  {
    id: "depression",
    icon: "🌧️",
    title: "Depression is not laziness",
    tag: "Mood",
    read: 4,
    sections: [
      ["What it is", "Depression flattens the machinery of motivation and pleasure. Things you used to enjoy feel gray; small tasks feel enormous. That's not a character flaw — it's a recognized change in how the brain processes reward and energy."],
      ["The spiral", "Depression whispers 'do nothing,' and doing nothing deepens depression. Behavioral activation — doing small, values-based activities before you feel like it — is one of the best-proven ways to reverse the spiral. Action first, motivation follows."],
      ["What helps", "Start absurdly small: a shower, a 5-minute walk, texting one person. Track your mood (the Tracker helps you see that feelings do move). Therapy and, for many, medication are genuinely effective. If you scored high on the PHQ-9, please talk to a professional."],
    ],
  },
  {
    id: "cbt",
    icon: "🔁",
    title: "The CBT triangle",
    tag: "Skills",
    read: 3,
    sections: [
      ["The core idea", "Thoughts, feelings, and behaviors form a triangle — each corner feeds the others. You can't directly command a feeling to change, but you can change thoughts and behaviors, and feelings follow."],
      ["Thought distortions", "Common 'bugs' in thinking: all-or-nothing ('I always fail'), mind-reading ('they think I'm boring'), catastrophizing ('this will ruin everything'), and discounting positives. Naming a distortion loosens its grip."],
      ["Try it", "Next time a heavy feeling hits, use the Journal's Thought Record: situation → automatic thought → evidence for and against → balanced thought. Done regularly, this literally retrains your default interpretations."],
    ],
  },
  {
    id: "sleep",
    icon: "😴",
    title: "Sleep: the foundation",
    tag: "Body",
    read: 3,
    sections: [
      ["Why it matters", "One bad night measurably increases next-day anxiety and emotional reactivity. Chronic short sleep is both a symptom and a cause of most mental health struggles. Sleep isn't a luxury; it's the substrate mood is built on."],
      ["The rules that work", "Consistent wake time (even weekends), daylight within an hour of waking, no caffeine after ~2pm, a wind-down hour with dim light, and the bed reserved for sleep. If you can't sleep after ~20 minutes, get up and do something calm until sleepy."],
      ["Racing mind at night?", "Try the Journal's Worry Dump before bed, or 4-7-8 breathing lying down. If insomnia persists for months, ask about CBT-I — a targeted therapy more effective than sleeping pills long-term."],
    ],
  },
  {
    id: "burnout",
    icon: "🔥",
    title: "Burnout vs. stress",
    tag: "Work & life",
    read: 3,
    sections: [
      ["The difference", "Stress is too much: pressure, urgency, over-engagement. Burnout is too little: emptiness, detachment, 'I just don't care anymore.' Stress responds to rest; burnout responds to meaning and boundary changes."],
      ["Three signatures", "Exhaustion that rest doesn't fix, cynicism about work you used to care about, and a sinking sense of ineffectiveness. If all three sound familiar, you're not weak — you've been running a marathon at sprint pace."],
      ["What helps", "Recovery needs more than a vacation: renegotiate load, reclaim control where possible, reconnect with why the work mattered, and protect genuinely restorative time (not just collapse-scrolling). Talking to someone helps you see options you can't see from inside."],
    ],
  },
  {
    id: "selfcompassion",
    icon: "🫂",
    title: "Self-compassion is a skill",
    tag: "Skills",
    read: 2,
    sections: [
      ["Not self-pity, not indulgence", "Self-compassion — treating yourself like you'd treat a struggling friend — is linked to more resilience and motivation, not less. Self-criticism feels productive but mostly produces shame, and shame paralyzes."],
      ["The three parts", "Kindness (a gentle inner tone), common humanity (suffering is part of being human, not proof you're uniquely broken), and mindfulness (noticing pain without drowning in it or denying it)."],
      ["Try it", "When you catch harsh self-talk, ask: 'What would I say to my best friend right now?' Then say that, to yourself, in the same tone. It feels awkward at first. It works anyway."],
    ],
  },
  {
    id: "emotions",
    icon: "🎨",
    title: "Name it to tame it",
    tag: "Skills",
    read: 2,
    sections: [
      ["Feelings are data", "Emotions are fast signals about your needs: anger flags a violated boundary, anxiety flags an uncertain threat, sadness flags a loss. They're messengers — often clumsy ones — not commands or facts."],
      ["Granularity helps", "People who label feelings precisely ('disappointed and a bit envious' vs. 'bad') regulate them better — brain-imaging studies show labeling literally calms the amygdala. The Tracker's emotion tags train exactly this skill."],
      ["Let them move", "Emotions are waves — they rise, crest, and pass, typically within minutes if not fed by rumination. Suppressing them makes them louder. Naming, breathing through, and journaling them lets them complete."],
    ],
  },
  {
    id: "help",
    icon: "🧑‍⚕️",
    title: "How therapy actually works",
    tag: "Getting help",
    read: 3,
    sections: [
      ["Demystified", "Therapy isn't lying on a couch analyzing dreams. Modern therapy is mostly structured skill-building and guided reflection with someone trained to spot patterns you can't see from the inside. Most people go for ordinary struggles, not 'serious disorders.'"],
      ["Finding a fit", "The relationship matters more than the modality — research says the 'fit' with your therapist predicts outcomes best. It's normal (and encouraged) to try a couple of therapists before settling. You're hiring them, not the other way around."],
      ["First steps", "Options: your doctor, university counseling, community mental health centers, employee assistance programs, and teletherapy platforms. Cost-limited? Look for sliding-scale clinics and training clinics. The Resources page lists starting points."],
    ],
  },
];

const tags = ["All", ...new Set(articles.map((a) => a.tag))];

export default function Learn() {
  const [open, setOpen] = useState(null);
  const [filter, setFilter] = useState("All");
  const shown = filter === "All" ? articles : articles.filter((a) => a.tag === filter);

  if (open) {
    const a = articles.find((x) => x.id === open);
    return (
      <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <button onClick={() => setOpen(null)} className="text-sm font-bold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 mb-6 cursor-pointer">
          ← Library
        </button>
        <div className="card p-8 md:p-12">
          <div className="text-5xl mb-5">{a.icon}</div>
          <div className="text-xs font-black uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-2">{a.tag} · {a.read} min read</div>
          <h1 className="font-display text-4xl font-semibold text-zinc-900 dark:text-white mb-8">{a.title}</h1>
          <div className="space-y-8">
            {a.sections.map(([h, body], i) => (
              <motion.section key={h} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }}>
                <h2 className="font-extrabold text-lg text-zinc-900 dark:text-white mb-2">{h}</h2>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{body}</p>
              </motion.section>
            ))}
          </div>
          <div className="mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap gap-3">
            <Link to="/ai" className="btn-primary px-6 py-3 text-sm">Discuss this with the Companion ✨</Link>
            <button onClick={() => setOpen(null)} className="btn-ghost px-6 py-3 text-sm text-zinc-700 dark:text-zinc-200">More articles</button>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <header className="text-center mb-10">
        <h1 className="font-display text-5xl font-semibold text-zinc-900 dark:text-white mb-3">Learn</h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          Short, honest, evidence-based reads. Understanding what's happening in your mind is half the battle.
        </p>
      </header>

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
              filter === t
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {shown.map((a, i) => (
            <motion.button
              layout
              key={a.id}
              onClick={() => setOpen(a.id)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.04 }}
              className="card card-hover p-7 text-left cursor-pointer"
            >
              <div className="text-3xl mb-4">{a.icon}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-1.5">{a.tag} · {a.read} min</div>
              <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white leading-snug">{a.title}</h3>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
