import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { PageHeader, Icon, CountUp, Stagger, StaggerItem, EASE } from "../components/ui";
import { MoodFace, MoodChart, WeekdayBars } from "../components/insights/Mood";
import { MOODS, ENERGY, TAGS, WEEKDAYS, NOTE_MAX, getCheckins, saveCheckin, todayKey, parseKey, streak, roughRun, lastNDays, average, weekdayPattern } from "../lib/checkin";

const SPRING = { type: "spring", stiffness: 420, damping: 36 };
// The real radio or checkbox is visually hidden inside its label, so the label shows the focus ring.
const FOCUS = "has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand";
const LEGEND = "text-[0.9375rem] font-semibold text-ink";
const OPTIONAL = <span className="font-normal text-ink-3"> Optional</span>;
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
// Panels that appear because of something the user did take focus, so keyboard and
// screen-reader users land on the new content instead of the top of the page.
const takeFocus = (node) => node?.focus({ preventScroll: true });

function CheckInForm({ initial, onSaved, onCancel }) {
  const [mood, setMood] = useState(initial?.mood ?? null);
  const [energy, setEnergy] = useState(initial?.energy ?? null);
  const [tags, setTags] = useState(initial?.tags ?? []);
  const [note, setNote] = useState(initial?.note ?? "");
  const [failed, setFailed] = useState(false);
  const ready = mood !== null && energy !== null;

  const submit = (e) => {
    e.preventDefault();
    if (!ready) return;
    const saved = saveCheckin({ date: todayKey(), mood, energy, tags, note: note.trim() });
    if (saved) onSaved();
    else setFailed(true);
  };

  return (
    <form onSubmit={submit} className="grid gap-7">
      <fieldset>
        <legend ref={initial ? takeFocus : undefined} tabIndex={-1} className="text-xl font-semibold tracking-[-0.02em] text-ink outline-none">
          How are you feeling?
        </legend>
        <div className="mt-4 grid grid-cols-5 gap-1.5 sm:gap-2.5">
          {MOODS.map((label, i) => {
            const on = mood === i + 1;
            return (
              <label key={label} className={`relative grid cursor-pointer justify-items-center gap-1.5 rounded-[var(--r-md)] bg-sunken px-0.5 pb-3 pt-3.5 text-xs font-medium transition-colors sm:text-sm ${FOCUS} ${on ? "text-brand-text" : "text-ink-3 hover:text-ink"}`}>
                <input type="radio" name="mood" className="sr-only" checked={on} onChange={() => setMood(i + 1)} />
                {on && <motion.span layoutId="mood-pill" className="absolute inset-0 rounded-[var(--r-md)] bg-brand-soft" transition={SPRING} />}
                <motion.span className="relative" animate={{ scale: on ? 1.16 : 1, y: on ? -2 : 0 }} whileTap={{ scale: 0.9 }} transition={SPRING}>
                  <MoodFace mood={i + 1} size={40} />
                </motion.span>
                <span className="relative">{label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <div className="flex items-baseline justify-between gap-3">
          <legend className={`${LEGEND} float-left`}>Energy</legend>
          <span className="text-sm text-ink-3" aria-hidden="true">{energy ? ENERGY[energy - 1] : "Tap a level"}</span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1.5 sm:gap-2.5">
          {ENERGY.map((label, i) => {
            const on = energy === i + 1;
            return (
              <label key={label} className={`relative flex h-14 cursor-pointer items-end justify-center rounded-[var(--r-md)] bg-sunken pb-3 ${FOCUS}`}>
                <input type="radio" name="energy" className="sr-only" checked={on} onChange={() => setEnergy(i + 1)} />
                <span className="sr-only">{i + 1} of 5, {label}</span>
                {on && <motion.span layoutId="energy-pill" className="absolute inset-0 rounded-[var(--r-md)] bg-brand-soft" transition={SPRING} />}
                <span aria-hidden="true" className={`relative w-2.5 rounded-full transition-colors duration-200 ${energy !== null && i < energy ? "bg-brand" : "bg-ink-3/30"}`} style={{ height: 8 + i * 6 }} />
              </label>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-xs text-ink-3" aria-hidden="true">
          <span>{ENERGY[0]}</span>
          <span>{ENERGY[4]}</span>
        </div>
      </fieldset>

      <fieldset>
        <legend className={LEGEND}>What is shaping today?{OPTIONAL}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {TAGS.map((tag) => {
            const on = tags.includes(tag);
            return (
              <label key={tag} className={`relative inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors ${FOCUS} ${on ? "border-transparent bg-brand-soft text-brand-text" : "border-line text-ink-2 hover:border-ink-3"}`}>
                <input type="checkbox" className="sr-only" checked={on} onChange={() => setTags(on ? tags.filter((t) => t !== tag) : [...tags, tag])} />
                {on && <Icon name="check" size={15} strokeWidth={2.2} />}
                {tag}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="checkin-note" className={LEGEND}>A line about today{OPTIONAL}</label>
          <span id="checkin-note-count" className="num text-xs text-ink-3">
            <span className="sr-only">Characters used: </span>
            {note.length} / {NOTE_MAX}
          </span>
        </div>
        <textarea id="checkin-note" className="input resize-none" rows={3} maxLength={NOTE_MAX} value={note} onChange={(e) => setNote(e.target.value)} aria-describedby="checkin-note-count" placeholder="Anything worth remembering" />
      </div>

      <div className="grid gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <button type="submit" className="btn btn-primary" disabled={!ready}>
            {initial ? "Update check-in" : "Save check-in"}
          </button>
          {initial && (
            <button type="button" className="btn btn-soft" onClick={onCancel}>
              Cancel
            </button>
          )}
          {!ready && <p className="text-sm text-ink-3">Pick a mood and an energy level to save.</p>}
        </div>
        {failed && (
          <p role="alert" className="text-sm font-medium text-rose">
            That did not save. This browser's storage may be full or switched off.
          </p>
        )}
        <p className="flex items-center gap-2 text-sm text-ink-3">
          <Icon name="lock" size={16} />
          Stays on this device. It is not uploaded to your account.
        </p>
      </div>
    </form>
  );
}

// The tick that draws itself after a save, with one soft ring that opens and fades.
function SavedMark({ celebrate }) {
  return (
    <span className="relative grid h-14 w-14 shrink-0 place-items-center" aria-hidden="true">
      {celebrate && <motion.span className="absolute inset-0 rounded-full border-2 border-brand" initial={{ scale: 0.8, opacity: 0.7 }} animate={{ scale: 1.9, opacity: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.15 }} />}
      <motion.span className="absolute inset-0 rounded-full bg-brand-soft" initial={celebrate ? { scale: 0.4, opacity: 0 } : false} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 380, damping: 20 }} />
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="relative">
        <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={celebrate ? { pathLength: 0 } : false} animate={{ pathLength: 1 }} transition={{ duration: 0.45, ease: EASE, delay: 0.2 }} />
      </svg>
    </span>
  );
}

function SavedToday({ entry, celebrate, onEdit }) {
  return (
    <div>
      <div className="flex items-center gap-4" role="status">
        <SavedMark celebrate={celebrate} />
        <div className="min-w-0">
          <h2 ref={celebrate ? takeFocus : undefined} tabIndex={-1} className="text-[1.75rem] outline-none">
            {celebrate ? "Saved for today" : "You checked in today"}
          </h2>
          <p className="mt-1 text-sm text-ink-3">{parseKey(entry.date).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
      </div>

      <div className="well mt-6 p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <MoodFace mood={entry.mood} size={44} className="text-brand" />
          <div>
            <p className="text-lg font-semibold text-ink">{MOODS[entry.mood - 1]}</p>
            <p className="text-sm text-ink-3">Energy: {ENERGY[entry.energy - 1].toLowerCase()}</p>
          </div>
        </div>
        {entry.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tags">
            {entry.tags.map((tag) => (
              <li key={tag} className="tag bg-surface">
                {tag}
              </li>
            ))}
          </ul>
        )}
        {entry.note && <p className="mt-4 whitespace-pre-wrap break-words text-ink-2">{entry.note}</p>}
      </div>

      <div className="mt-6 flex flex-wrap gap-2.5">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onEdit}>
          <Icon name="pencil" size={17} />
          Edit today
        </button>
        <Link to="/results" className="btn btn-soft btn-sm">
          Open Insights
          <Icon name="arrow" size={17} />
        </Link>
      </div>
      <p className="mt-5 flex items-center gap-2 text-sm text-ink-3">
        <Icon name="lock" size={16} />
        Stays on this device. It is not uploaded to your account.
      </p>
    </div>
  );
}

// Shown after two or more "Rough" days running. An offer, not an alarm.
function GentleNote() {
  return (
    <motion.aside className="well mt-5 p-5 sm:p-6" aria-label="If today is heavy" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}>
      <p className="font-semibold text-ink">A few rough days in a row.</p>
      <p className="mt-1.5 text-ink-2">That happens, and you do not have to fix it today. If it would help, two minutes of slow breathing can take the edge off, and there are people you can talk to whenever you want.</p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <Link to="/breathe" className="btn btn-dark btn-sm">
          <Icon name="wind" size={17} />
          Breathing exercise
        </Link>
        <Link to="/help" className="btn btn-ghost btn-sm">
          <Icon name="heart" size={17} />
          Ways to get support
        </Link>
      </div>
    </motion.aside>
  );
}

// Names a weekday only when at least two weekdays have two or more entries and one is clearly ahead.
function weekdayInsight(pattern) {
  const solid = pattern.map((p, i) => ({ ...p, day: WEEKDAYS[i] })).filter((p) => p.count >= 2).sort((a, b) => b.mood - a.mood);
  if (solid.length < 2 || solid[0].mood === solid[1].mood) return "Weekday patterns take a couple of weeks of check-ins to show.";
  return `So far, ${solid[0].day}s have been your brightest days and ${solid.at(-1).day}s the heaviest.`;
}

function Pattern({ checkins, today }) {
  const run = streak(checkins, today);
  const week = lastNDays(checkins, 7, today).filter(Boolean).length;
  const mean = average(checkins, "mood", 7, today);
  const month = lastNDays(checkins, 30, today);
  const pattern = weekdayPattern(checkins);
  const loggedToday = month.at(-1) !== null;
  return (
    <Stagger className="mt-5 grid gap-4" key={`${checkins.length}-${month.at(-1)?.mood}`}>
      <StaggerItem className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="flex items-center gap-1.5 text-sm text-ink-3">
            <Icon name="flame" size={18} className={run ? "text-brand" : ""} />
            Streak
          </p>
          <p className="display mt-2 text-5xl">
            <CountUp value={run} duration={0.8} />
          </p>
          <p className="mt-2 text-sm text-ink-3">{run === 0 ? "Check in today to start one." : `${run === 1 ? "day" : "days"} in a row${loggedToday ? "" : ". Today keeps it going"}.`}</p>
        </div>
        <div className="card p-5">
          <p className="flex items-center gap-1.5 text-sm text-ink-3">
            <Icon name="smile" size={18} />
            7-day average
          </p>
          <p className="display mt-2 text-5xl">
            {mean === null ? "–" : <CountUp value={mean} decimals={1} duration={0.8} />}
            {mean !== null && <span className="font-sans text-lg text-ink-3"> / 5</span>}
          </p>
          <p className="mt-2 text-sm text-ink-3">{mean === null ? "Nothing logged this week." : `Around "${MOODS[Math.round(mean) - 1]}", from ${plural(week, "check-in")}.`}</p>
        </div>
      </StaggerItem>

      <StaggerItem className="card p-5 sm:p-6">
        <h3 className="text-lg">Last 30 days</h3>
        <div className="mt-4">
          <MoodChart slots={month} today={today} />
        </div>
      </StaggerItem>

      <StaggerItem className="card p-5 sm:p-6">
        <h3 className="text-lg">By weekday</h3>
        <p className="mt-1 text-sm text-ink-3">{weekdayInsight(pattern)}</p>
        <div className="mt-5">
          <WeekdayBars pattern={pattern} />
        </div>
      </StaggerItem>
    </Stagger>
  );
}

export default function CheckIn() {
  const [today] = useState(todayKey);
  const [checkins, setCheckins] = useState(getCheckins);
  const entry = checkins.find((c) => c.date === today);
  const [editing, setEditing] = useState(!entry);
  const [celebrate, setCelebrate] = useState(false);

  const saved = () => {
    setCheckins(getCheckins());
    setCelebrate(true);
    setEditing(false);
  };

  return (
    <>
      <PageHeader eyebrow="Daily check-in" title="How is today going?" lead="Ten seconds, once a day. A short note to yourself about how things feel, so you can look back and notice what helps." />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-10">
        <div>
          <div className="card overflow-hidden p-5 sm:p-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={editing ? "form" : "saved"} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
                {editing || !entry ? <CheckInForm initial={entry} onSaved={saved} onCancel={() => setEditing(false)} /> : <SavedToday entry={entry} celebrate={celebrate} onEdit={() => setEditing(true)} />}
              </motion.div>
            </AnimatePresence>
          </div>
          {roughRun(checkins, today) >= 2 && <GentleNote />}
        </div>

        <section aria-labelledby="pattern-heading">
          <h2 id="pattern-heading" className="text-[2rem]">
            Your pattern
          </h2>
          {checkins.length === 0 ? (
            <div className="well mt-5 p-6 sm:p-8">
              <p className="font-semibold text-ink">Nothing here yet, and that is fine.</p>
              <p className="mt-1.5 text-ink-2">After your first check-in you will see your streak, your last 30 days as a line, and how your weekdays compare.</p>
            </div>
          ) : (
            <Pattern checkins={checkins} today={today} />
          )}
          <p className="mt-5 text-sm text-ink-3">A personal log for noticing patterns. It is not a clinical measure of mood, and it cannot diagnose anything.</p>
        </section>
      </div>
    </>
  );
}
