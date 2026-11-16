import { Link } from "react-router-dom";
import { Stagger, StaggerItem, Icon } from "../ui";
import { CATEGORIES, questionnaires, byId } from "../../lib/tests/questionnaires";
import { lessons } from "../../lib/learn";
import { byTest } from "./shape";

const DAY = 864e5;
const RETAKE_AFTER = 14; // days: these screens ask about "the last 2 weeks"
const asksAboutTwoWeeks = (test) => test.category === "wellbeing" && /\b(2|two) weeks\b/i.test(test.intro ?? "");

// Plain rules, in priority order. Each suggestion says why it is there. No AI involved.
function suggestions(results, progress, now) {
  const out = [];
  const tests = byTest(results);
  const lessonFor = (id) => lessons.find((l) => l.id === id);

  // 1. The lesson behind the most recent test, if it has not been completed.
  const recent = tests[0] && byId(tests[0][0].testId);
  const lesson = recent?.lesson && !progress[recent.lesson] && lessonFor(recent.lesson);
  if (lesson) out.push({ key: "lesson", icon: "learn", to: `/learn/${lesson.id}`, action: "Read the lesson", title: lesson.title, why: `You took ${recent.name} most recently, and this lesson explains what it measures.` });

  // 2. A two-week mood screen whose latest result is two weeks old or more (the oldest first).
  const due = tests
    .map(([latest]) => ({ test: byId(latest.testId), days: Math.floor((now - new Date(latest.date)) / DAY) }))
    .filter(({ test, days }) => asksAboutTwoWeeks(test) && days >= RETAKE_AFTER)
    .sort((a, b) => b.days - a.days)[0];
  if (due) out.push({ key: "retake", icon: "refresh", to: `/tests/${due.test.id}`, action: "Take it again", title: due.test.name, why: `It asks about the last two weeks, and your latest result is ${due.days} days old.` });

  // 3. A category with nothing in it yet. Sensitive screeners are never suggested unprompted.
  const tried = new Set(tests.map(([e]) => byId(e.testId).category));
  for (const c of CATEGORIES) {
    const open = questionnaires.filter((q) => q.category === c.id && !q.sensitive).sort((a, b) => (a.minutes ?? 0) - (b.minutes ?? 0))[0];
    if (tried.has(c.id) || !open) continue;
    out.push({ key: "category", icon: "tests", to: `/tests/${open.id}`, action: open.minutes ? `Start, about ${open.minutes} min` : "Start", title: open.name, why: `You have not tried anything in ${c.name} yet.` });
    break;
  }

  // 4. The foundations lesson, until it is done.
  const basics = !progress["how-tests-work"] && lessonFor("how-tests-work");
  if (basics && lesson?.id !== basics.id) out.push({ key: "basics", icon: "spark", to: `/learn/${basics.id}`, action: "Read the lesson", title: basics.title, why: "It makes every score on this page easier to read." });

  return out.slice(0, 3);
}

export default function Suggested({ results, progress, now }) {
  const items = suggestions(results, progress, now);
  if (!items.length) return null;
  return (
    <section aria-labelledby="suggested-heading">
      <h2 id="suggested-heading" className="text-[2rem]">
        Suggested next
      </h2>
      <p className="mt-2 text-ink-3">Picked by simple rules from what is on this page. Each one says why.</p>
      <Stagger as="ul" className="mt-5 grid gap-4 md:grid-cols-3">
        {items.map((s) => (
          <StaggerItem as="li" key={s.key}>
            <Link to={s.to} className="card card-hover group flex h-full flex-col p-5">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-sunken text-ink">
                <Icon name={s.icon} size={20} />
              </span>
              <h3 className="mt-4 text-[1.0625rem]">{s.title}</h3>
              <p className="mt-1.5 text-sm text-ink-3">{s.why}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-brand-text">
                {s.action}
                <Icon name="arrow" size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
