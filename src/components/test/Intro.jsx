import { Link } from "react-router-dom";
import { BLUEPRINTS, TIME_LIMIT_SEC } from "../../lib/tests/matrix";
import { BackLink, Icon, Stagger, StaggerItem } from "../ui";

const FACTS = [
  ["target", "What it measures", "measures"],
  ["info", "What it can't tell you", "cannot"],
  ["learn", "Source", "source"],
];

// The page before a test starts: what it measures, what it cannot tell you, source and time.
export default function Intro({ test, draft, unavailable, onStart }) {
  const type = test.scoring.type;
  const total = type === "matrix" ? BLUEPRINTS.length : test.items?.length ?? 0;
  const answered = draft?.answers ? draft.answers.filter((a) => a !== null && a !== -1).length : 0;
  return (
    <div className="mx-auto max-w-3xl">
      <BackLink to="/tests">All tests</BackLink>
      <Stagger gap={0.06}>
        <StaggerItem>
          <p className="eyebrow mb-3">{test.instrument}</p>
          <h1 className="text-[2.5rem] sm:text-5xl md:text-[3.5rem]">{test.name}</h1>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="tag num">
              <Icon name="clock" size={13} />
              About {test.minutes} {test.minutes === 1 ? "minute" : "minutes"}
            </span>
            {total > 0 && <span className="tag num">{total} {type === "matrix" ? "puzzles" : "questions"}</span>}
            {type === "matrix" && <span className="tag num">{TIME_LIMIT_SEC / 60}-minute limit</span>}
          </div>
        </StaggerItem>

        <StaggerItem as="dl" className="card mt-8 divide-y divide-line">
          {FACTS.map(([icon, label, key]) => (
            <div key={key} className="flex gap-4 p-5 sm:p-6">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-text" aria-hidden="true">
                <Icon name={icon} size={20} />
              </span>
              <div>
                <dt className="font-semibold text-ink">{label}</dt>
                <dd className={`mt-1 ${key === "source" ? "text-sm text-ink-3" : ""}`}>{test[key]}</dd>
              </div>
            </div>
          ))}
        </StaggerItem>

        {test.sensitive && (
          <StaggerItem as="p" className="well mt-5 p-5 text-[0.9375rem]">
            Some of these questions are personal. Answer honestly for yourself, and stop whenever you want to. The
            result can suggest whether talking to a professional might help, but it cannot diagnose anything.
          </StaggerItem>
        )}
        {type === "matrix" && (
          <StaggerItem as="p" className="well mt-5 p-5 text-[0.9375rem]">
            24 puzzles, easy to hard, with a 20-minute limit. In each, find the piece that completes the 3×3 pattern. Rules run along
            the rows. You can skip and come back. Every attempt gets a fresh set of puzzles with the same difficulty.
          </StaggerItem>
        )}

        <StaggerItem className="mt-8 flex flex-wrap gap-3">
          {unavailable ? (
            <p className="well w-full p-5" role="status">
              <strong>This task is not available yet.</strong> It is being built. Please check back soon.
            </p>
          ) : draft && answered > 0 ? (
            <>
              <button className="btn btn-primary btn-lg" onClick={() => onStart(draft)}>
                Continue <span className="num font-medium opacity-80">{answered} of {total}</span>
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => onStart(null)}>Start over</button>
            </>
          ) : (
            <button className="btn btn-primary btn-lg" onClick={() => onStart(null)}>
              Start the test <Icon name="arrow" size={19} />
            </button>
          )}
          {test.lesson && <Link to={`/learn/${test.lesson}`} className="btn btn-soft btn-lg">Read the lesson first</Link>}
        </StaggerItem>
      </Stagger>
    </div>
  );
}
