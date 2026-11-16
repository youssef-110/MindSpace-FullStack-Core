import { useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useParams } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { lessons, lessonById } from "../lib/learn";
import { byId } from "../lib/tests/questionnaires";
import { getProgress } from "../lib/storage";
import { BackLink, EASE, Icon, Reveal, Stagger, StaggerItem } from "../components/ui";
import Quiz from "../components/learn/Quiz";
import ReadTime from "../components/learn/ReadTime";

// A hairline at the very top of the viewport that fills as the article is read.
// Portalled to <body> so the page's entrance transform can't re-anchor `position: fixed`.
function ReadingProgress({ target }) {
  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end end"] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 420, damping: 36 });
  return createPortal(<motion.div aria-hidden="true" className="no-print fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-brand" style={{ scaleX }} />, document.body);
}

function NextStep({ to, eyebrow, title, meta, action }) {
  return (
    <StaggerItem>
      <Link to={to} className="card card-hover flex h-full flex-col p-6">
        <span className="eyebrow">{eyebrow}</span>
        <span className="mt-2 text-xl font-semibold tracking-[-0.02em] text-ink">{title}</span>
        {meta && <span className="mt-1 text-sm text-ink-3">{meta}</span>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-brand-text">
          {action}
          <Icon name="arrow" size={16} />
        </span>
      </Link>
    </StaggerItem>
  );
}

function LessonView({ lesson }) {
  const article = useRef(null);
  const test = lesson.test && byId(lesson.test);
  const next = lessons[(lessons.indexOf(lesson) + 1) % lessons.length];
  const score = getProgress()[lesson.id];

  return (
    <article ref={article} className="reading mx-auto">
      <ReadingProgress target={article} />
      <BackLink to="/learn">All lessons</BackLink>

      <motion.header initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
        {lesson.track && <p className="eyebrow mb-3">{lesson.track}</p>}
        <h1 className="text-[2.5rem] sm:text-5xl md:text-[3.5rem]">{lesson.title}</h1>
        <p className="lead mt-4">{lesson.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <ReadTime lesson={lesson} />
          {score && (
            <span className="tag tag-good num">
              <Icon name="check" size={14} />
              Quiz {score.correct}/{score.total}
            </span>
          )}
        </div>
      </motion.header>

      <hr className="hairline my-10 md:my-12" />

      <div className="prose-lesson">
        {lesson.sections.map(([heading, body], i) => (
          <Reveal as="section" key={heading} className="mb-12 last:mb-0">
            <p className="num eyebrow mb-2">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="mb-4 text-[1.75rem] sm:text-[2rem]">{heading}</h2>
            {body.split(/\n{2,}/).map((para, k) => (
              <p key={k} className="last:mb-0">{para}</p>
            ))}
          </Reveal>
        ))}
      </div>

      {/* Optional data: `terms: [[term, definition], …]` on a lesson. */}
      {lesson.terms?.length > 0 && (
        <Reveal as="aside" className="well mt-12 p-5 sm:p-7">
          <h2 className="font-sans text-sm font-semibold tracking-[-0.01em] text-ink-3">Key terms</h2>
          <dl className="mt-4 grid gap-4">
            {lesson.terms.map(([term, definition]) => (
              <div key={term}>
                <dt className="font-semibold text-ink">{term}</dt>
                <dd className="mt-0.5 text-[0.9375rem]">{definition}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      )}

      <Quiz key={lesson.id} lesson={lesson} />

      <section className="mt-16 md:mt-20" aria-label="Next steps">
        <Stagger className="grid gap-4 sm:grid-cols-2">
          {test && (
            <NextStep
              to={`/tests/${test.id}`}
              eyebrow="Put it into practice"
              title={test.cta ?? `Take the ${test.name.toLowerCase()} test`}
              meta={`${test.instrument} · ${test.minutes} min`}
              action="Start the test"
            />
          )}
          <NextStep to={`/learn/${next.id}`} eyebrow="Next lesson" title={next.title} meta={next.summary} action="Keep reading" />
        </Stagger>
      </section>
    </article>
  );
}

export default function Lesson() {
  const { id } = useParams();
  const lesson = lessonById(id);
  if (!lesson) {
    return (
      <div className="reading mx-auto py-16 text-center">
        <h1 className="text-[2.5rem] sm:text-5xl">Lesson not found</h1>
        <p className="lead mt-4">This lesson may have moved or been renamed.</p>
        <Link to="/learn" className="btn btn-primary mt-8">
          See all lessons
        </Link>
      </div>
    );
  }
  return <LessonView key={lesson.id} lesson={lesson} />;
}
