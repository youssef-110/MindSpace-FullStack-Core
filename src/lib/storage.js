// Everything stays in this browser's localStorage. Nothing is sent to a server
// except what the user explicitly asks the AI to explain.

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

// ---------------- Test results ----------------

export const getResults = () => load("results", []);

export function saveResult(testId, result) {
  const entry = { id: `${testId}-${Date.now()}`, testId, date: new Date().toISOString(), result };
  save("results", [entry, ...getResults()].slice(0, 300));
  return entry;
}

export const getResult = (id) => getResults().find((r) => r.id === id);

export function deleteResult(id) {
  save("results", getResults().filter((r) => r.id !== id));
}

// ---------------- Lesson progress ----------------

export const getProgress = () => load("progress", {});

export function saveQuizScore(lessonId, correct, total) {
  const progress = getProgress();
  const best = Math.max(correct, progress[lessonId]?.correct ?? 0);
  save("progress", { ...progress, [lessonId]: { correct: best, total, date: new Date().toISOString() } });
}

// ---------------- Backup ----------------

export function exportData() {
  return JSON.stringify({ app: "mindspace", version: 2, results: getResults(), progress: getProgress() }, null, 2);
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
  return valid.length;
}
