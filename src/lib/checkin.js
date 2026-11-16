// The daily check-in: one short entry per local calendar day, kept only on this device.
// It is a personal log, not a clinical measure, and it is never uploaded to the account.
// Entry: { date: "YYYY-MM-DD", mood: 1..5, energy: 1..5, tags: string[], note: string }
import { load, save, emit, cleanCheckin } from "./storage";

export const MOODS = ["Rough", "Low", "Okay", "Good", "Great"]; // index = mood - 1
export const ENERGY = ["Empty", "Tired", "Steady", "Lively", "Full"]; // index = energy - 1
export const TAGS = ["Sleep", "Work", "People", "Health", "Exercise", "Outside"];
export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const NOTE_MAX = 280;

// Days are local calendar dates. toISOString() is UTC and would move late-evening entries
// to the next day for anyone west of Greenwich (and early-morning ones back, east of it).
const pad = (n) => String(n).padStart(2, "0");
export const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayKey = () => dateKey(new Date());
export const parseKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};
// Calendar arithmetic, not 24-hour arithmetic: safe across daylight-saving changes.
export const shiftKey = (key, days) => {
  const d = parseKey(key);
  d.setDate(d.getDate() + days);
  return dateKey(d);
};

// Newest first.
export const getCheckins = () => load("checkins", []);

// Saves the entry for its day, replacing an earlier one from the same day.
// Returns the stored entry, or null when the entry is invalid or the browser refused to store it.
export function saveCheckin(entry) {
  const clean = cleanCheckin(entry);
  if (!clean) return null;
  const next = [clean, ...getCheckins().filter((c) => c.date !== clean.date)].sort((a, b) => b.date.localeCompare(a.date));
  if (!save("checkins", next)) return null;
  emit("mindspace:checkin-saved", clean);
  return clean;
}

const byDate = (checkins) => new Map(checkins.map((c) => [c.date, c]));

// Consecutive logged days ending today, or yesterday when today is not logged yet, for which
// `test` holds. Not having checked in yet today does not break a run.
function run(checkins, today, test) {
  const days = byDate(checkins);
  let day = days.has(today) ? today : shiftKey(today, -1);
  let n = 0;
  while (days.has(day) && test(days.get(day))) {
    n += 1;
    day = shiftKey(day, -1);
  }
  return n;
}

export const streak = (checkins, today = todayKey()) => run(checkins, today, () => true);

// How many days running the mood has been 1 ("Rough"). Used only to offer support gently.
export const roughRun = (checkins, today = todayKey()) => run(checkins, today, (c) => c.mood === 1);

// The last n days, oldest first and ending today: each slot is that day's entry, or null.
// Slot i is the day shiftKey(today, i - (n - 1)).
export function lastNDays(checkins, n, today = todayKey()) {
  const days = byDate(checkins);
  return Array.from({ length: n }, (_, i) => days.get(shiftKey(today, i - (n - 1))) ?? null);
}

// Mean of `field` ("mood" or "energy") over the last `days` days, or null with no entries.
export function average(checkins, field, days, today = todayKey()) {
  const logged = lastNDays(checkins, days, today).filter(Boolean);
  return logged.length ? logged.reduce((sum, c) => sum + c[field], 0) / logged.length : null;
}

// Seven slots, Monday first: { count, mood } where mood is the mean, or null with no entries.
export function weekdayPattern(checkins) {
  const slots = Array.from({ length: 7 }, () => ({ count: 0, total: 0 }));
  for (const c of checkins) {
    const slot = slots[(parseKey(c.date).getDay() + 6) % 7];
    slot.count += 1;
    slot.total += c.mood;
  }
  return slots.map(({ count, total }) => ({ count, mood: count ? total / count : null }));
}
