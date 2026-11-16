import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import MatrixCell, { MatrixGrid } from "../components/MatrixCell";
import { BLUEPRINTS, generateItem } from "../lib/tests/matrix";
import { questionnaires, CATEGORIES, byId } from "../lib/tests/questionnaires";
import { lessons } from "../lib/learn";
import { getResults, getProgress } from "../lib/storage";
import { CountUp, EASE, Icon, LogoMark, Reveal, Sky, Sparkline, Stagger, StaggerItem } from "../components/ui";

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

// ---------------- Hero ----------------

const HEADLINE = ["Learn how the mind is measured.", "Then measure yours."];
const TRUST = ["Published instruments", "Scored in your browser", "No account needed"];

const rise = { hidden: { opacity: 0, y: "0.45em" }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } } };

function Hero({ testCount }) {
  return (
    <Sky className="m-2 min-h-[clamp(640px,92svh,900px)] rounded-[30px] sm:m-3" aria-labelledby="hero-title">
      {/* One orchestrated entrance: words, then sublead, actions, trust row. */}
      <motion.div
        className="container-page pb-48 pt-28 text-center sm:pt-32 md:pb-60"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
      >
        <h1 id="hero-title" className="mx-auto max-w-5xl text-[clamp(2.75rem,7vw,5.25rem)] leading-[1.02]">
          <span className="sr-only">{HEADLINE.join(" ")}</span>
          {HEADLINE.map((line) => (
            <span key={line} aria-hidden="true" className="block">
              {line.split(" ").map((word, i) => (
                <Fragment key={i}>
                  <motion.span variants={rise} className="inline-block">
                    {word}
                  </motion.span>{" "}
                </Fragment>
              ))}
            </span>
          ))}
        </h1>
        <motion.p variants={rise} className="sky-text mx-auto mt-5 max-w-2xl text-[1.0625rem] leading-[1.55] text-white/90 sm:mt-6 sm:text-lg">
          Bite-sized psychology lessons, {testCount} research-based tests from personality to reasoning, and results that tell you the
          truth, including what a score can't say.
        </motion.p>
        <motion.div variants={rise} className="mt-7 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row">
          <Link to="/tests" className="btn btn-sky btn-lg w-full max-w-xs sm:w-auto">
            Browse the tests
            <Icon name="arrow" size={20} />
          </Link>
          <Link to="/learn" className="btn btn-sky-ghost btn-lg w-full max-w-xs sm:w-auto">
            Explore the lessons
          </Link>
        </motion.div>
        <motion.ul variants={rise} className="sky-text mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-white/90">
          {TRUST.map((t) => (
            <li key={t} className="inline-flex items-center gap-1.5">
              <Icon name="check" size={16} strokeWidth={2.4} />
              {t}
            </li>
          ))}
        </motion.ul>
      </motion.div>
    </Sky>
  );
}

// The interactive sample puzzle, presented as the product mockup that overlaps the sky.
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
      initial={{ opacity: 0, y: 44 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
      className="card mx-auto grid max-w-[880px] gap-5 rounded-[30px] p-5 sm:p-8 md:grid-cols-[minmax(0,340px)_1fr] md:gap-x-10 md:gap-y-4"
    >
      <div className="md:col-start-2 md:self-end">
        <p className="eyebrow">Try one</p>
        <h2 className="mt-2 text-[1.75rem] sm:text-[2rem]">Which piece completes the pattern?</h2>
      </div>
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.9 } } }}
        className="mx-auto w-full max-w-[340px] md:col-start-1 md:row-span-2 md:row-start-1 md:self-center"
      >
        <MatrixGrid cells={item.cells} reveal={solved} />
      </motion.div>
      <div className="md:col-start-2 md:self-start">
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Answer choices">
          {choices.map((i) => {
            const state = picked === i ? (i === item.correctIndex ? "right" : "wrong") : null;
            return (
              <motion.button
                key={i}
                role="radio"
                aria-checked={picked === i}
                onClick={() => setPicked(i)}
                animate={state === "wrong" ? { x: [0, -6, 6, -4, 4, 0] } : {}}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className={`aspect-square rounded-[var(--r-md)] border-2 bg-surface p-1.5 text-ink transition-colors ${
                  state === "right" ? "border-sage bg-sage-soft" : state === "wrong" ? "border-rose bg-rose-soft" : "border-line hover:border-ink-3"
                }`}
              >
                <MatrixCell cell={item.options[i]} />
              </motion.button>
            );
          })}
        </div>
        <p className="mt-4 min-h-[4.5rem] text-[0.9375rem] text-ink-2" aria-live="polite">
          {solved
            ? "Right. Each row holds all three shapes and all three counts. That's fluid reasoning at work."
            : picked !== null
              ? "Not quite. Look at what changes along each row: the shape, and the number."
              : "Twenty-four of these, getting harder, make up our IQ test."}
        </p>
        <Link to="/tests/matrix" className="btn btn-primary mt-2 w-full sm:w-auto">
          Take the IQ test
          <Icon name="arrow" size={18} />
        </Link>
      </div>
    </motion.div>
  );
}

// ---------------- Returning visitors ----------------

const stripCell = "group flex min-h-[116px] flex-col justify-center bg-surface p-5 transition-colors hover:bg-sunken sm:p-6";

function ContinueStrip({ progress, last }) {
  const next = lessons.find((l) => !progress[l.id]);
  const done = Object.keys(progress).length;
  if (!last && !done) return null;
  const lastTest = last && byId(last.testId);
  return (
    <section aria-label="Pick up where you left off" className="container-page mt-12 md:mt-16">
      <Reveal>
        <p className="eyebrow mb-3" aria-hidden="true">
          Pick up where you left off
        </p>
        <div className="card grid gap-px overflow-hidden bg-line sm:grid-cols-3">
          <div className="flex min-h-[116px] flex-col justify-center bg-surface p-5 sm:p-6">
            <p className="text-sm text-ink-3">Lessons completed</p>
            <p className="display mt-1 text-4xl">
              <CountUp value={done} />
              <span className="num font-sans text-base text-ink-3"> / {lessons.length}</span>
            </p>
          </div>
          {lastTest ? (
            <Link to={`/results/${last.id}`} className={stripCell}>
              <p className="text-sm text-ink-3">Your latest result</p>
              <p className="mt-1 font-semibold text-ink group-hover:text-brand-text">{lastTest.name}</p>
              <p className="text-sm text-ink-3">{new Date(last.date).toLocaleDateString()}</p>
            </Link>
          ) : (
            <Link to="/tests" className={stripCell}>
              <p className="text-sm text-ink-3">No tests yet</p>
              <p className="mt-1 font-semibold text-ink group-hover:text-brand-text">Choose your first test</p>
            </Link>
          )}
          {next ? (
            <Link to={`/learn/${next.id}`} className={stripCell}>
              <p className="text-sm text-ink-3">Up next</p>
              <p className="mt-1 font-semibold text-ink group-hover:text-brand-text">{next.title}</p>
              <p className="text-sm text-ink-3">{next.minutes} min read</p>
            </Link>
          ) : (
            <Link to="/results" className={stripCell}>
              <p className="text-sm text-ink-3">Every lesson done</p>
              <p className="mt-1 font-semibold text-ink group-hover:text-brand-text">See your progress</p>
            </Link>
          )}
        </div>
      </Reveal>
    </section>
  );
}

// ---------------- How it works ----------------

const STEPS = [
  ["Learn the idea", "Short lessons explain what a trait or ability is and how psychologists measure it.", "/learn/how-tests-work", "Start with a lesson"],
  ["Take the test", "Published questionnaires with their original wording and scoring, or our timed reasoning puzzles.", "/tests", "Browse the tests"],
  ["Read an honest result", "Plain-language results that say what the score means and what it can't tell you.", "/results", "See your insights"],
];

const arrowLink = "group inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] font-medium text-brand-text";
const arrowNudge = "transition-transform duration-300 group-hover:translate-x-1";

function HowItWorks() {
  return (
    <section className="container-page section" aria-labelledby="how">
      <div className="grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
        <Reveal className="md:sticky md:top-28 md:self-start">
          <p className="eyebrow mb-3">How it works</p>
          <h2 id="how" className="text-4xl sm:text-5xl">
            Understand it first. Then measure it.
          </h2>
          <p className="lead mt-5 max-w-md">A score means more when you know what was measured and how. So every test here comes with the idea behind it.</p>
        </Reveal>
        <Stagger as="ol" gap={0.12} className="border-b border-line">
          {STEPS.map(([title, text, to, cta], i) => (
            <StaggerItem as="li" key={title} className="grid grid-cols-[3.5rem_1fr] gap-x-4 border-t border-line py-7 sm:grid-cols-[5.5rem_1fr] sm:py-9">
              <span className="display num text-[2.75rem] text-ink-3 sm:text-6xl" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl sm:text-2xl">{title}</h3>
                <p className="mt-2 max-w-md">{text}</p>
                <Link to={to} className={`${arrowLink} mt-2`}>
                  {cta}
                  <Icon name="arrow" size={17} className={arrowNudge} />
                </Link>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

// ---------------- Test library (built from data) ----------------

// Six-column bento. Spans repeat in pairs so every row is full, whatever the number of categories.
const BENTO = [4, 2, 3, 3, 2, 4];
const SPAN = { 2: "md:col-span-2", 3: "md:col-span-3", 4: "md:col-span-4", 6: "md:col-span-6" };

function Library() {
  const groups = CATEGORIES.map((c) => ({ ...c, tests: questionnaires.filter((q) => q.category === c.id) })).filter((g) => g.tests.length);
  return (
    <section className="container-page section pt-0 md:pt-0" aria-labelledby="library">
      <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 md:mb-12">
        <div>
          <p className="eyebrow mb-3">The test library</p>
          <h2 id="library" className="max-w-2xl text-4xl sm:text-5xl">
            {plural(questionnaires.length, "test")}, each one a research instrument.
          </h2>
        </div>
        <Link to="/tests" className={arrowLink}>
          See all {plural(questionnaires.length, "test")}
          <Icon name="arrow" size={17} className={arrowNudge} />
        </Link>
      </Reveal>
      <Stagger className="grid gap-4 md:grid-cols-6 md:gap-5">
        {groups.map((g, i) => {
          const span = i === groups.length - 1 && groups.length % 2 ? 6 : BENTO[i % BENTO.length];
          const shown = g.tests.slice(0, span >= 4 ? 4 : 3);
          const more = g.tests.length - shown.length;
          return (
            <StaggerItem key={g.id} className={SPAN[span]}>
              <Link to={`/tests#${g.id}`} className="card card-hover group flex h-full min-h-[220px] flex-col p-6 sm:p-7">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <h3 className="text-xl sm:text-[1.375rem]">{g.name}</h3>
                    <p className="mt-1.5 max-w-sm text-[0.9375rem] text-ink-3">{g.blurb}</p>
                  </div>
                  <span className="display num text-5xl sm:text-6xl" aria-hidden="true">
                    {g.tests.length}
                  </span>
                </div>
                <ul className="mt-auto flex flex-wrap gap-2 pt-8" aria-label={`Tests in ${g.name}`}>
                  {shown.map((t) => (
                    <li key={t.id} className="tag max-w-full overflow-hidden">
                      {t.name}
                    </li>
                  ))}
                  {more > 0 && <li className="tag">+{more} more</li>}
                </ul>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-text">
                  {plural(g.tests.length, "test")}
                  <Icon name="arrow" size={16} className={arrowNudge} />
                </span>
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}

// ---------------- Honest by design ----------------

const PROMISES = [
  ["shield", "Real instruments", "Every questionnaire is a published measure with its original items, reverse-keying and cutoffs. Its source is on the test page."],
  ["lock", "Scored in your browser", "Scores are calculated on your device by code covered by 70+ automated tests, never by the AI."],
  ["info", "Limits on every result", "Each result says what the score means and, next to it, what it cannot tell you."],
  ["target", "Honest uncertainty", "The IQ test gives a range, not a single falsely precise number. We don't invent percentiles we can't support."],
  ["clock", "Response-quality checks", "Rushed answers, or the same answer all the way down, are flagged on the result instead of being silently scored."],
  ["heart", "No diagnoses", "Screeners say whether a professional conversation might help. They never tell you that you have a condition."],
];

function Honest() {
  const stats = [
    [questionnaires.length, "research-based tests, scored the way their authors specify"],
    [lessons.length, "short lessons on what is being measured, and how"],
    [new Set(questionnaires.map((q) => q.category)).size, "areas of the mind, from reasoning to mood"],
    [0, "individual answers sent to a server. They stay on your device"],
  ];
  return (
    <section className="container-page section" aria-labelledby="honest">
      <Reveal>
        <p className="eyebrow mb-4">Honest by design</p>
        <h2 id="honest" className="max-w-4xl text-[clamp(2.25rem,5.6vw,4.25rem)]">
          What we promise about accuracy, and what we don't.
        </h2>
        <p className="lead mt-6 max-w-2xl">
          Most online tests are written for clicks. These are research instruments, scored the way their authors specify, with their limits
          printed next to every result.
        </p>
      </Reveal>
      <Stagger className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:mt-16 md:grid-cols-4 md:gap-x-10">
        {stats.map(([value, label]) => (
          <StaggerItem key={label} className="border-t border-ink pt-4">
            <p className="display text-6xl md:text-7xl">
              <CountUp value={value} />
            </p>
            <p className="mt-3 max-w-[15rem] text-[0.9375rem] text-ink-3">{label}</p>
          </StaggerItem>
        ))}
      </Stagger>
      <Stagger as="dl" className="mt-14 grid gap-x-10 gap-y-9 sm:grid-cols-2 md:mt-20 lg:grid-cols-3">
        {PROMISES.map(([icon, title, text]) => (
          <StaggerItem key={title}>
            <dt className="flex items-center gap-2.5 text-lg font-semibold text-ink">
              <Icon name={icon} size={20} className="text-brand" />
              {title}
            </dt>
            <dd className="mt-2">{text}</dd>
          </StaggerItem>
        ))}
      </Stagger>
      <Reveal className="mt-10">
        <Link to="/learn/how-tests-work" className="btn btn-ghost">
          How psychological tests work
        </Link>
      </Reveal>
    </section>
  );
}

// ---------------- Lessons preview ----------------

function LessonMeta({ lesson, progress }) {
  const p = progress[lesson.id];
  return p ? (
    <span className="tag tag-good num shrink-0">
      <Icon name="check" size={13} strokeWidth={2.4} />
      {p.correct}/{p.total}
      <span className="sr-only"> (completed)</span>
    </span>
  ) : (
    <span className="num shrink-0 text-sm text-ink-3">{lesson.minutes} min</span>
  );
}

function LessonsPreview({ progress }) {
  const featured = lessons.find((l) => !progress[l.id]) ?? lessons[0];
  const rest = lessons.filter((l) => l !== featured).slice(0, 4);
  if (!featured) return null;
  return (
    <section className="container-page section pt-0 md:pt-0" aria-labelledby="lessons">
      <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 md:mb-12">
        <div>
          <p className="eyebrow mb-3">The syllabus</p>
          <h2 id="lessons" className="max-w-2xl text-4xl sm:text-5xl">
            Short lessons, written to be finished.
          </h2>
        </div>
        <Link to="/learn" className={arrowLink}>
          All {plural(lessons.length, "lesson")}
          <Icon name="arrow" size={17} className={arrowNudge} />
        </Link>
      </Reveal>
      <div className="grid gap-5 md:grid-cols-[1fr_1.1fr] md:gap-8">
        <Reveal>
          <Link to={`/learn/${featured.id}`} className="card card-hover group flex h-full min-h-[300px] flex-col rounded-[30px] p-7 sm:p-9">
            <div className="flex items-center justify-between gap-3">
              <span className="tag tag-brand">{progress[featured.id] ? "Read again" : "Start here"}</span>
              <LessonMeta lesson={featured} progress={progress} />
            </div>
            <p className="eyebrow mt-auto pt-12">{featured.track}</p>
            <p className="display mt-2 text-[2rem] leading-[1.05] sm:text-[2.5rem]">{featured.title}</p>
            <p className="mt-3 max-w-md">{featured.summary}</p>
            <span className={`${arrowLink} mt-4`}>
              Read the lesson
              <Icon name="arrow" size={17} className={arrowNudge} />
            </span>
          </Link>
        </Reveal>
        <Stagger as="ul" className="border-b border-line">
          {rest.map((l) => (
            <StaggerItem as="li" key={l.id} className="border-t border-line">
              <Link to={`/learn/${l.id}`} className="group flex items-center justify-between gap-5 py-5">
                <span className="min-w-0">
                  <span className="block text-sm text-ink-3">{l.track}</span>
                  <span className="mt-0.5 block text-lg font-semibold text-ink transition-colors group-hover:text-brand-text">{l.title}</span>
                  <span className="mt-1 block text-[0.9375rem] text-ink-3">{l.summary}</span>
                </span>
                <LessonMeta lesson={l} progress={progress} />
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

// ---------------- Daily tools ----------------

const toolCard = "card card-hover group flex h-full flex-col p-6 sm:p-7";

function DailyTools() {
  return (
    <section className="container-page section pt-0 md:pt-0" aria-labelledby="tools">
      <Reveal className="mb-8 md:mb-12">
        <p className="eyebrow mb-3">Daily tools</p>
        <h2 id="tools" className="max-w-2xl text-4xl sm:text-5xl">
          Small things, for the days between tests.
        </h2>
      </Reveal>
      <Stagger className="grid gap-4 md:grid-cols-5 md:grid-rows-2 md:gap-5">
        <StaggerItem className="md:col-span-3 md:row-span-2">
          <Link to="/checkin" className={`${toolCard} min-h-[280px] rounded-[30px] sm:p-9`}>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand-text">
              <Icon name="calendar" />
            </span>
            <div className="mt-auto flex items-end justify-between gap-6 pt-12">
              <div>
                <h3 className="text-2xl sm:text-[1.75rem]">Daily check-in</h3>
                <p className="mt-2 max-w-sm">A minute a day to note how you are doing, so the weeks add up to a trend you can read.</p>
                <span className={`${arrowLink} mt-3`}>
                  Check in today
                  <Icon name="arrow" size={17} className={arrowNudge} />
                </span>
              </div>
              {/* Illustrative line, not the visitor's data. */}
              <span className="hidden shrink-0 pb-4 sm:block">
                <Sparkline points={[3, 2, 3, 4, 3, 4, 5]} width={150} height={56} />
              </span>
            </div>
          </Link>
        </StaggerItem>
        <StaggerItem className="md:col-span-2">
          <Link to="/breathe" className={toolCard}>
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl">Breathing exercise</h3>
              <span className="relative grid h-11 w-11 shrink-0 place-items-center text-brand-text" aria-hidden="true">
                <motion.span className="absolute inset-0 rounded-full bg-brand-soft" animate={{ scale: [0.72, 1, 0.72] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
                <Icon name="wind" size={20} className="relative" />
              </span>
            </div>
            <p className="mt-2">Two minutes of slow breathing can calm your body's stress response. Pick a pattern and follow along.</p>
            <span className={`${arrowLink} mt-auto pt-3`}>
              Breathe now
              <Icon name="arrow" size={17} className={arrowNudge} />
            </span>
          </Link>
        </StaggerItem>
        <StaggerItem className="md:col-span-2">
          <Link to="/ask" className={toolCard}>
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl">Ask AI</h3>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-text">
                <Icon name="ask" size={20} />
              </span>
            </div>
            <p className="mt-2">Questions about psychology, the lessons, or what a test measures. It explains. It doesn't diagnose, and it never decides a score.</p>
            <span className={`${arrowLink} mt-auto pt-3`}>
              Ask a question
              <Icon name="arrow" size={17} className={arrowNudge} />
            </span>
          </Link>
        </StaggerItem>
      </Stagger>
    </section>
  );
}

// ---------------- FAQ ----------------

const FAQ = [
  ["How accurate is the IQ test?", "It gives a practice IQ estimate. The puzzles follow the same logic as Raven's matrices and the scoring uses a proper statistical model, but the difficulty of each puzzle is estimated from its design, not measured on a large norm group. So we show a range, usually about 13 points either side, and never call it an official IQ. A real IQ assessment is done one-to-one by a psychologist."],
  ["Can a test here diagnose me?", "No. The mood, attention and personality-pattern tests are screeners: they flag whether a professional conversation might be worth having. Only a qualified clinician can diagnose."],
  ["Where do the questions come from?", "Each questionnaire is a published research instrument, such as the IPIP Big Five, PHQ-9 or MSI-BPD, used with its original items, keying and cutoffs. Each test page lists its source."],
  ["Do I need an account?", "No. Every lesson and test works without one, and your results stay in your browser. A free account adds the AI assistant and, only if you choose, keeps your results and progress across devices."],
  ["Where is my data stored?", "Without an account, only in your browser. With an account, lesson progress is stored in an EU data centre, and test results only if you explicitly turn that on. Your individual answers never leave your device. The privacy policy has the details."],
  ["What does the AI do?", "It explains concepts and helps you read a score the site already calculated. It never decides scores or labels, and it won't diagnose. Each account gets a daily number of AI requests so it stays available for everyone."],
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="container-page section pt-0 md:pt-0" aria-labelledby="faq">
      <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
        <Reveal className="md:sticky md:top-28 md:self-start">
          <p className="eyebrow mb-3">Questions</p>
          <h2 id="faq" className="text-4xl sm:text-5xl">
            Fair things to ask before you start.
          </h2>
          <p className="mt-5 max-w-sm">
            Something else on your mind?{" "}
            <Link to="/contact" className="link">
              Write to us
            </Link>
            .
          </p>
        </Reveal>
        <Reveal className="border-b border-line">
          {FAQ.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={q} className="border-t border-line">
                <h3 className="text-lg">
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex min-h-[64px] w-full items-center justify-between gap-5 py-4 text-left font-semibold"
                  >
                    {q}
                    <motion.span
                      aria-hidden="true"
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors ${isOpen ? "bg-brand-soft text-brand-text" : "bg-sunken text-ink-2"}`}
                    >
                      <Icon name="plus" size={18} />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-a-${i}`}
                      role="region"
                      aria-labelledby={`faq-q-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[62ch] pb-6 pr-12">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}

// ---------------- Closing ----------------

function Closing() {
  return (
    <section className="container-page" aria-labelledby="closing">
      <Reveal className="card flex flex-col items-center rounded-[30px] px-6 py-14 text-center sm:px-10 md:py-20">
        <LogoMark size={52} className="animate-float" />
        <h2 id="closing" className="mt-7 max-w-3xl text-[clamp(2.25rem,5.4vw,4rem)]">
          A clearer picture of your own mind, honestly drawn.
        </h2>
        <p className="lead mt-5 max-w-xl">Start with a lesson or go straight to a test. Nothing to install, and no account needed.</p>
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <Link to="/tests" className="btn btn-primary btn-lg w-full max-w-xs sm:w-auto">
            Choose a test
            <Icon name="arrow" size={20} />
          </Link>
          <Link to="/learn/how-tests-work" className="btn btn-ghost btn-lg w-full max-w-xs sm:w-auto">
            Start with a lesson
          </Link>
        </div>
        <p className="mt-8 max-w-lg text-sm text-ink-3">
          MindSpace is for education and self-reflection. It is not a medical service, and no result here is a diagnosis. If you are struggling,{" "}
          <Link to="/help" className="link">
            help is available
          </Link>
          .
        </p>
      </Reveal>
    </section>
  );
}

export default function Home() {
  const [progress] = useState(getProgress);
  const [last] = useState(() => getResults()[0]);
  return (
    <>
      <Hero testCount={questionnaires.length} />
      <div className="container-page relative z-10 -mt-36 md:-mt-48">
        <HeroPuzzle />
      </div>
      <ContinueStrip progress={progress} last={last} />
      <HowItWorks />
      <Library />
      <Honest />
      <LessonsPreview progress={progress} />
      <DailyTools />
      <Faq />
      <Closing />
    </>
  );
}
