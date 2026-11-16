import { Link } from "react-router-dom";
import { Ring, Icon, Stagger, StaggerItem } from "../ui";
import { MoodFace, WeekStrip } from "./Mood";
import { MOODS, ENERGY, streak, lastNDays } from "../../lib/checkin";
import { lessons } from "../../lib/learn";
import { plural } from "./shape";

function CheckInCard({ checkins, today }) {
  const entry = checkins.find((c) => c.date === today);
  const run = streak(checkins, today);
  const week = lastNDays(checkins, 7, today);
  return (
    <div className="card flex h-full flex-col p-5 sm:p-7">
      <p className="eyebrow">Daily check-in</p>
      {entry ? (
        <div className="mt-4 flex items-center gap-4">
          <MoodFace mood={entry.mood} size={52} className="text-brand" />
          <div>
            <h2 className="text-[1.75rem]">{MOODS[entry.mood - 1]} today</h2>
            <p className="mt-1 text-sm text-ink-3">Energy: {ENERGY[entry.energy - 1].toLowerCase()}</p>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <h2 className="text-[1.75rem]">How is today going?</h2>
          <p className="mt-2 max-w-md text-ink-2">{run ? `You have checked in ${plural(run, "day")} running. Ten seconds keeps it going.` : "Ten seconds, once a day. A short note to yourself that stays on this device."}</p>
        </div>
      )}
      <div className="mt-auto flex flex-wrap items-end justify-between gap-x-6 gap-y-5 pt-7">
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/checkin" className={`btn ${entry ? "btn-ghost btn-sm" : "btn-primary"}`}>
            {entry ? "Edit or see your pattern" : "Check in"}
            <Icon name="arrow" size={18} />
          </Link>
          {run > 0 && (
            <span className="tag">
              <Icon name="flame" size={14} className="text-brand" />
              {plural(run, "day")} in a row
            </span>
          )}
        </div>
        {checkins.length > 0 && <WeekStrip slots={week} today={today} />}
      </div>
    </div>
  );
}

function LessonsCard({ progress, tests, saved }) {
  const done = lessons.filter((l) => progress[l.id]).length;
  return (
    <div className="card flex h-full items-center gap-5 p-5 sm:p-7">
      <Ring value={done} max={lessons.length} size={116} stroke={9} label={`${done} of ${lessons.length} lessons completed`}>
        <span>
          <span className="num block text-2xl font-semibold text-ink">{done}</span>
          <span className="num block text-xs text-ink-3">of {lessons.length}</span>
        </span>
      </Ring>
      <div className="min-w-0">
        <h2 className="font-sans text-lg font-semibold tracking-[-0.02em]">Lessons completed</h2>
        <p className="mt-1 text-sm text-ink-3">
          {plural(tests, "different test")} taken, {plural(saved, "result")} saved.
        </p>
        <Link to="/learn" className="link mt-3 inline-flex min-h-11 items-center text-sm">
          {done === lessons.length ? "Review a lesson" : done ? "Continue learning" : "Start learning"}
        </Link>
      </div>
    </div>
  );
}

// Top row of the dashboard: today's check-in beside lesson progress.
export default function Today({ checkins, today, progress, tests, saved }) {
  return (
    <Stagger className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <StaggerItem>
        <CheckInCard checkins={checkins} today={today} />
      </StaggerItem>
      <StaggerItem>
        <LessonsCard progress={progress} tests={tests} saved={saved} />
      </StaggerItem>
    </Stagger>
  );
}
