// Local-first storage in this browser's localStorage. When the user is signed in, the
// account sync (src/lib/sync.js) listens for the events below and mirrors changes.

const PREFIX = "mindspace:";

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const emit = (name, detail) => {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(name, { detail }));
};

export function remove(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* storage unavailable: nothing to remove */
  }
}

// ---------------- Test results ----------------

export const getResults = () => load("results", []);

export function saveResult(testId, result) {
  const entry = { id: `${testId}-${Date.now()}`, testId, date: new Date().toISOString(), result };
  save("results", [entry, ...getResults()].slice(0, 300));
  emit("mindspace:result-saved", entry);
  return entry;
}

export const getResult = (id) => getResults().find((r) => r.id === id);

export function deleteResult(id) {
  save("results", getResults().filter((r) => r.id !== id));
  emit("mindspace:result-deleted", id);
}

// ---------------- Lesson progress ----------------

export const getProgress = () => load("progress", {});

export function saveQuizScore(lessonId, correct, total) {
  const progress = getProgress();
  const best = Math.max(correct, progress[lessonId]?.correct ?? 0);
  const entry = { correct: best, total, date: new Date().toISOString() };
  save("progress", { ...progress, [lessonId]: entry });
  emit("mindspace:progress-saved", { lessonId, ...entry });
}

// Removes all MindSpace personal data from this device, including other accounts' parked copies.
export function clearDeviceData() {
  ["results", "progress", "checkins", "chat", "aiCache", "aiConsent", "owner"].forEach(remove);
  // Parked copies of any account's data on this device go too.
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX + "stash:"))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* storage unavailable: nothing to remove */
  }
  emit("mindspace:device-cleared");
}

// ---------------- Daily check-ins (logic lives in src/lib/checkin.js) ----------------

const isLevel = (n) => Number.isInteger(n) && n >= 1 && n <= 5;

// Returns a clean check-in entry, or null when the input is not one. `date` is a local YYYY-MM-DD.
export function cleanCheckin(e) {
  if (!e || typeof e.date !== "string" || !isLevel(e.mood) || !isLevel(e.energy)) return null;
  const [y, m, d] = /^\d{4}-\d{2}-\d{2}$/.test(e.date) ? e.date.split("-").map(Number) : [];
  const day = new Date(y, m - 1, d);
  if (day.getFullYear() !== y || day.getMonth() !== m - 1 || day.getDate() !== d) return null; // rejects 2026-02-31
  const tags = Array.isArray(e.tags) ? [...new Set(e.tags.filter((t) => typeof t === "string" && t.trim()).map((t) => t.trim().slice(0, 24)))].slice(0, 12) : [];
  return { date: e.date, mood: e.mood, energy: e.energy, tags, note: typeof e.note === "string" ? e.note.slice(0, 280) : "" };
}

// ---------------- Backup ----------------

// `checkins` was added without a version bump: older backups simply lack the field.
export function exportData() {
  return JSON.stringify({ app: "mindspace", version: 2, results: getResults(), progress: getProgress(), checkins: load("checkins", []) }, null, 2);
}

export function importData(json) {
  const data = JSON.parse(json);
  if (data?.app !== "mindspace" || !Array.isArray(data.results) || typeof data.progress !== "object") {
    throw new Error("This file isn't a MindSpace backup.");
  }
  const valid = data.results.filter((r) => r && typeof r.id === "string" && typeof r.testId === "string" && typeof r.date === "string" && ["traits", "sum", "threshold", "matrix"].includes(r.result?.type));
  const known = new Set(getResults().map((r) => r.id));
  save("results", [...getResults(), ...valid.filter((r) => !known.has(r.id))].sort((a, b) => b.date.localeCompare(a.date)));
  save("progress", { ...getProgress(), ...data.progress });
  if (Array.isArray(data.checkins)) {
    // One per day. A day already logged on this device keeps its entry.
    const mine = load("checkins", []);
    const days = new Set(mine.map((c) => c.date));
    const incoming = data.checkins.map(cleanCheckin).filter((c) => c && !days.has(c.date) && days.add(c.date));
    if (incoming.length) save("checkins", [...mine, ...incoming].sort((a, b) => b.date.localeCompare(a.date)));
  }
  return valid.length;
}
