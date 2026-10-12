// Small localStorage wrapper — everything on MindSpace stays on the user's device
// unless they use the (Firebase-backed) tracker sync.

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

export function remove(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

// Append to a capped list (newest first).
export function appendToList(key, item, cap = 500) {
  const list = load(key, []);
  const next = [item, ...list].slice(0, cap);
  save(key, next);
  return next;
}

// ---------------- Monetization & Tier Management ----------------
export const MAX_FREE_DAILY_MESSAGES = 5;

export function getUserTier() {
  return load("userTier", "free"); // 'free' | 'pro'
}

export function setUserTier(tier) {
  save("userTier", tier);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("mindspace:tier-change", { detail: { tier } }));
  }
  return tier;
}

export function isProUser() {
  return getUserTier() === "pro";
}

export function getDailyAiUsage() {
  const today = new Date().toISOString().slice(0, 10);
  const usage = load("aiDailyUsage", { date: today, count: 0 });
  if (usage.date !== today) {
    return { date: today, count: 0 };
  }
  return usage;
}

export function incrementDailyAiUsage() {
  const current = getDailyAiUsage();
  const next = { date: current.date, count: current.count + 1 };
  save("aiDailyUsage", next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("mindspace:usage-change", { detail: next }));
  }
  return next;
}

export function unlockReport(reportId) {
  const unlocked = load("unlockedReports", []);
  if (!unlocked.includes(reportId)) {
    save("unlockedReports", [...unlocked, reportId]);
  }
}

export function isReportUnlocked(reportId) {
  if (isProUser()) return true;
  const unlocked = load("unlockedReports", []);
  return unlocked.includes(reportId);
}
