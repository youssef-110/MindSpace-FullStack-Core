import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { byId } from "../lib/tests/questionnaires";
import { getResult, getResults } from "../lib/storage";
import { BackLink, CrisisCallout, EASE, Icon } from "../components/ui";
import ScoreHero from "../components/test/ScoreHero";
import ScoreView from "../components/test/ScoreViews";
import AiExplain from "../components/test/AiExplain";
import { Actions, Change, QualityNote } from "../components/test/ResultExtras";

const TITLE = "font-sans text-xl font-semibold tracking-[-0.02em]";
// Paper is always light: without this a result printed from the night theme is pale text on white.
const PRINT_LIGHT =
  "print:[--ink:#000] print:[--ink-2:#222] print:[--ink-3:#555] print:[--surface:#fff] print:[--sunken:#eee] print:[--line:#ccc] print:[--brand:#007aff] print:[--brand-text:#0064d2] print:[--brand-soft:#e8f2ff] print:[--sage:#16794c] print:[--amber:#8f5f00] print:[--rose:#c0392f] print:[--sage-soft:#e6f4ec] print:[--amber-soft:#fbf1dc] print:[--rose-soft:#fdecea]";

const valueOf = (r) => (r.type === "matrix" ? r.estimate : r.score);
const CONCERN = ["warn", "alert"];
const list = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } };

// Cards rise in on load rather than on scroll, so a page printed straight away is complete.
function Rise({ children }) {
  return <motion.div variants={item}>{children}</motion.div>;
}

export default function Result() {
  const { id } = useParams();
  const entry = getResult(id);
  // A result can outlive its test (removed test, older backup); the results list hides those, so this page does too.
  const test = entry && byId(entry.testId);
  if (!test) return <p className="py-20">Result not found. <Link to="/results" className="link">See your results</Link></p>;
  const r = entry.result;
  // Every attempt at this test up to this one, oldest first.
  const past = getResults()
    .filter((x) => x.testId === entry.testId && x.date <= entry.date)
    .sort((a, b) => a.date.localeCompare(b.date));
  const previous = past.at(-2);
  const points = past.map((x) => valueOf(x.result));
  const comparable = previous && points.every(Number.isFinite);
  const lowWellbeing = (r.type === "sum" && !r.unit && CONCERN.includes(r.band?.tone)) || (r.type === "traits" && r.traits.some((t) => CONCERN.includes(t.tone)));

  return (
    <motion.article className={`mx-auto max-w-3xl space-y-5 ${PRINT_LIGHT}`} variants={list} initial="hidden" animate="show">
      <div className="no-print -mb-5">
        <BackLink to="/results">Insights</BackLink>
      </div>

      {r.riskFlag && <CrisisCallout />}

      <Rise>
        <ScoreHero test={test} entry={entry} />
      </Rise>

      <QualityNote quality={r.quality} />

      <Rise>
        <section className="card p-5 sm:p-8" aria-labelledby="meaning">
          <h2 id="meaning" className={`${TITLE} mb-5`}>What this means</h2>
          <ScoreView test={test} r={r} prev={previous?.result} />
        </section>
      </Rise>

      {comparable && (
        <Rise>
          <Change points={points} prevDate={previous.date} lowerIsBetter={r.lowerIsBetter} />
        </Rise>
      )}

      {lowWellbeing && (
        <Rise>
          <p className="well flex gap-3 p-5">
            <Icon name="wind" className="mt-0.5 text-brand-text" />
            <span>
              Something you can do right now: a two-minute <Link to="/breathe" className="link">breathing exercise</Link>. When you're ready,{" "}
              <Link to="/help" className="link">here's how to find support</Link>.
            </span>
          </p>
        </Rise>
      )}

      <Rise>
        <AiExplain entry={entry} />
      </Rise>

      <Rise>
        <section className="card p-5 sm:p-8" aria-labelledby="limits">
          <h2 id="limits" className={TITLE}>Accuracy and limitations</h2>
          <p className="mt-3">{test.cannot}</p>
          <p className="mt-3 text-sm text-ink-3">{test.source}</p>
          <div className="no-print mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {test.lesson && <Link to={`/learn/${test.lesson}`} className="link">Learn what this test measures</Link>}
            <Link to="/learn/how-tests-work" className="link">How psychological tests work</Link>
          </div>
        </section>
      </Rise>

      <Rise>
        <Actions test={test} entry={entry} />
      </Rise>
    </motion.article>
  );
}
