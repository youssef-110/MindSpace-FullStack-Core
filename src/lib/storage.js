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
