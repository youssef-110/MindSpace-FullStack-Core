import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader, Reveal, Sky, Icon } from "../components/ui";
import Today from "../components/insights/Today";
import Glance from "../components/insights/Glance";
import Suggested from "../components/insights/Suggested";
import History from "../components/insights/History";
import Backup from "../components/insights/Backup";
import { visible, byTest, plural } from "../components/insights/shape";
import { getResults, getProgress, deleteResult } from "../lib/storage";
import { getCheckins, dateKey } from "../lib/checkin";
import { useAuth } from "../lib/auth-context";

const greeting = (hour) => (hour < 5 ? "Good evening" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");

// First visit: nothing saved yet. One clear first step, two quieter ones.
function Welcome() {
  return (
    <Sky as="div" className="rounded-[var(--r-xl)] px-6 pb-36 pt-12 sm:px-12 sm:pb-44 sm:pt-16">
      <h2 className="sky-text max-w-xl text-4xl sm:text-5xl">Your insights start with one small step</h2>
      <p className="sky-text mt-4 max-w-lg text-lg text-white/90">Take a short test, and this page becomes a record of how you score, how that changes, and what to read next. Your first result takes about two minutes.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/tests" className="btn btn-sky">
          Choose a test
          <Icon name="arrow" size={18} />
        </Link>
        <Link to="/checkin" className="btn btn-sky-ghost">
          Do a ten-second check-in
        </Link>
        <Link to="/learn" className="btn btn-sky-ghost">
          Read a lesson
        </Link>
      </div>
    </Sky>
  );
}

export default function Results() {
  const { user, consent } = useAuth();
  const [now] = useState(() => new Date());
  const [results, setResults] = useState(() => visible(getResults()));
  const [progress, setProgress] = useState(getProgress);
  const [checkins, setCheckins] = useState(getCheckins);
  const tests = byTest(results);
  const empty = !results.length && !checkins.length && !Object.keys(progress).length;

  const refresh = () => {
    setResults(visible(getResults()));
    setProgress(getProgress());
    setCheckins(getCheckins());
  };
  const remove = (id) => {
    deleteResult(id);
    refresh();
  };

  return (
    <>
      <PageHeader
        eyebrow={now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
        title={greeting(now.getHours())}
        lead={
          user
            ? consent
              ? "Your results are saved in this browser and in your account. Take a test again any time to see how you've changed."
              : "Your results are saved in this browser. Lesson progress syncs to your account, and you can turn on result syncing from your account page."
            : "Your results are saved only in this browser. Sign in to keep your progress across devices."
        }
      />

      <div className="grid gap-14 md:gap-20">
        {empty ? <Welcome /> : <Today checkins={checkins} today={dateKey(now)} progress={progress} tests={tests.length} saved={results.length} />}

        {!empty && <Suggested results={results} progress={progress} now={now} />}

        {!empty && (
          <section aria-labelledby="glance-heading">
            <h2 id="glance-heading" className="text-[2rem]">
              At a glance
            </h2>
            {results.length ? (
              <>
                <p className="mb-6 mt-2 text-ink-3">Your latest result for each of the {plural(tests.length, "test")} you have taken. A score describes your answers on one day, not who you are.</p>
                <Glance results={results} />
              </>
            ) : (
              <div className="well mt-5 p-6 sm:p-8">
                <p className="font-semibold text-ink">No test results yet.</p>
                <p className="mt-1.5 text-ink-2">Your first one takes about two minutes.</p>
                <Link to="/tests" className="btn btn-primary mt-5">
                  Choose a test
                </Link>
              </div>
            )}
          </section>
        )}

        {results.length > 0 && <History results={results} onDelete={remove} />}

        <Reveal>
          <Backup hasData={!empty} onImported={refresh} />
        </Reveal>
      </div>
    </>
  );
}
