import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MatrixGrid } from "../components/MatrixCell";
import MatrixCell from "../components/MatrixCell";
import { BLUEPRINTS, generateItem } from "../lib/tests/matrix";
import { questionnaires, CATEGORIES } from "../lib/tests/questionnaires";
import { lessons } from "../lib/learn";

const ease = [0.22, 1, 0.36, 1];

function Reveal({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease }}
    >
      {children}
    </motion.div>
  );
}

function HeroPuzzle() {
  const item = useMemo(() => generateItem(BLUEPRINTS[8], 2024), []);
  // Show the answer plus three balanced alternatives.
  const choices = useMemo(() => {
    const wrong = item.options.map((_, i) => i).filter((i) => i !== item.correctIndex).slice(0, 3);
    return [...wrong.slice(0, 2), item.correctIndex, wrong[2]];
  }, [item]);
  const [picked, setPicked] = useState(null);
  const solved = picked === item.correctIndex;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease }}
      className="panel p-4 sm:p-6 w-full max-w-[420px] mx-auto"
    >
      <p className="mb-3 font-bold">Try one. Which piece completes the pattern?</p>
      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.35 } } }}>
        <MatrixGrid cells={item.cells} reveal={solved} />
      </motion.div>
      <div className="mt-4 grid grid-cols-4 gap-2" role="radiogroup" aria-label="Answer choices">
        {choices.map((i) => {
          const state = picked === i ? (i === item.correctIndex ? "right" : "wrong") : null;
          return (
            <motion.button
              key={i}
              role="radio"
              aria-checked={picked === i}
              onClick={() => setPicked(i)}
              animate={state === "wrong" ? { x: [0, -6, 6, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className={`aspect-square rounded-[var(--r-sm)] border-2 bg-surface p-1.5 transition-colors ${
                state === "right" ? "border-sage" : state === "wrong" ? "border-rose" : "border-line hover:border-ink-2"
              }`}
            >
              <MatrixCell cell={item.options[i]} />
            </motion.button>
          );
        })}
      </div>
      <p className="mt-3 min-h-[3rem] text-[0.95rem] text-ink-2" aria-live="polite">
        {solved
          ? "Right. Each row holds all three shapes and all three counts. That's fluid reasoning at work."
          : picked !== null
            ? "Not quite. Look at what changes along each row: the shape, and the number."
            : "Twenty-four of these, getting harder, make up our reasoning test."}
      </p>
    </motion.div>
  );
}

const STEPS = [
  ["Learn the idea", "Short lessons explain what a trait or ability is and how psychologists measure it."],
  ["Take the test", "Published questionnaires with their original wording and scoring, or our timed reasoning puzzles."],
  ["Read an honest result", "Plain-language results that say what the score means and what it can't tell you."],
];

const FAQ = [
  ["Is the IQ test accurate?", "It's a practice estimate. The puzzles follow the same logic as Raven's matrices and the scoring uses a proper statistical model, but the difficulty of each puzzle is estimated from its design, not measured on a large norm group. So we show a range, usually about ±13 points, and never call it an official IQ. A real IQ assessment is done one-to-one by a psychologist."],
  ["Can a test here diagnose me?", "No. The mood, attention and personality-pattern tests are screeners: they flag whether a professional conversation might be worth having. Only a qualified clinician can diagnose."],
  ["Where do the questions come from?", "Each questionnaire is a published research instrument, such as the IPIP Big Five, PHQ-9 or MSI-BPD, used with its original items, keying and cutoffs. Each test page lists its source."],
  ["Where is my data stored?", "In your browser only. There are no accounts. Your results never leave your device unless you press 'Explain with AI', which sends just the scores, never your answers."],
  ["What does the AI do?", "It explains concepts and helps you read a score the site already calculated. It never decides scores or labels, and it won't diagnose."],
];

export default function Home() {
  const testCount = questionnaires.length;
  return (
    <>
      {/* Hero */}
      <section className="grid items-center gap-10 py-10 md:grid-cols-[1.15fr_1fr] md:py-20">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-7xl font-extrabold"
          >
            Learn how the mind is measured. Then measure yours.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease }}
            className="mt-5 max-w-xl text-lg text-ink-2"
          >
            Bite-sized psychology lessons, {testCount} research-based tests from personality to reasoning, and results that tell you
            the truth, including what a score can't say.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link to="/learn/how-tests-work" className="btn btn-primary">Start with a lesson</Link>
            <Link to="/tests" className="btn btn-quiet">Browse the tests</Link>
          </motion.div>
        </div>
        <HeroPuzzle />
      </section>

      {/* How it works */}
      <section className="py-14" aria-labelledby="how">
        <Reveal>
          <h2 id="how" className="text-3xl sm:text-4xl font-bold mb-8">How it works</h2>
        </Reveal>
        <ol className="grid gap-6 sm:grid-cols-3">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="border-t-2 border-ink pt-4">
              <span className="font-display text-sm font-bold text-ink-2">Step {i + 1}</span>
              <h3 className="mt-1 text-2xl font-bold">{t}</h3>
              <p className="mt-2 text-ink-2">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Tests */}
      <section className="py-14" aria-labelledby="tests">
        <Reveal className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <h2 id="tests" className="text-3xl sm:text-4xl font-bold">The tests</h2>
          <Link to="/tests" className="link">See all {testCount} tests</Link>
        </Reveal>
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
          {CATEGORIES.map((c) => (
            <div key={c.id}>
              <h3 className="text-xl font-bold">{c.name}</h3>
              <p className="text-sm text-ink-2 mb-2">{c.blurb}</p>
              <ul className="divide-y divide-line border-y border-line">
                {questionnaires.filter((q) => q.category === c.id).map((q) => (
                  <li key={q.id}>
                    <Link to={`/tests/${q.id}`} className="group flex items-center justify-between gap-4 py-3">
                      <span>
                        <span className="font-bold group-hover:text-brand">{q.name}</span>
                        <span className="block text-sm text-ink-2">{q.instrument}</span>
                      </span>
                      <span className="tag shrink-0">{q.minutes} min</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Learning topics */}
      <section className="py-14" aria-labelledby="topics">
        <Reveal className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <h2 id="topics" className="text-3xl sm:text-4xl font-bold">Learning topics</h2>
          <Link to="/learn" className="link">All lessons</Link>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.slice(0, 6).map((l) => (
            <Link key={l.id} to={`/learn/${l.id}`} className="panel p-5 transition-transform hover:-translate-y-0.5">
              <span className="tag">{l.track}</span>
              <h3 className="mt-3 text-xl font-bold">{l.title}</h3>
              <p className="mt-1.5 text-[0.95rem] text-ink-2">{l.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="py-14" aria-labelledby="trust">
        <div className="rounded-[var(--r-lg)] bg-ink text-paper p-6 sm:p-10">
          <h2 id="trust" className="text-3xl sm:text-4xl font-bold max-w-2xl">What we promise about accuracy, and what we don't</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              ["Real instruments", "Every questionnaire is a published measure with its original items, reverse-keying and cutoffs, and its source on the test page."],
              ["Scoring you can check", "Scores are calculated by code with 60+ automated tests, never by the AI."],
              ["Honest uncertainty", "The reasoning test gives a range, not a single IQ number. We don't invent percentiles we can't support."],
              ["No diagnoses", "Screeners say whether a professional conversation might help. They never tell you that you have a condition."],
            ].map(([t, d]) => (
              <div key={t}>
                <h3 className="text-lg font-bold text-marigold">{t}</h3>
                <p className="mt-1 opacity-85">{d}</p>
              </div>
            ))}
          </div>
          <Link to="/learn/how-tests-work" className="btn mt-8 bg-paper text-ink">How psychological tests work</Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 max-w-3xl" aria-labelledby="faq">
        <h2 id="faq" className="text-3xl sm:text-4xl font-bold mb-6">Questions</h2>
        <div className="divide-y divide-line border-y border-line">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold">
                {q}
                <span className="text-2xl leading-none text-ink-2 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 text-ink-2">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
