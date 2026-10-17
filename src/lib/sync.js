// Keeps this browser's results and lesson progress in step with the signed-in account.
// Results (health-related data) only leave the device when the user has given explicit consent.
import { supabase } from "./supabase";
import { getResults, getProgress, save, load, remove } from "./storage";

const KNOWN_TYPES = ["traits", "sum", "threshold", "matrix"];
const PERSONAL_KEYS = ["results", "progress", "chat", "aiCache", "aiConsent"];

const snapshot = () => Object.fromEntries(PERSONAL_KEYS.map((k) => [k, load(k, null)]));

// Signing out parks the account's device data (restored on its next sign-in) and empties the
// active keys, so anonymous use on this device starts clean and is never tied to that account.
export function releaseDevice() {
  const owner = load("owner", null);
  if (!owner) return;
  save(`stash:${owner}`, snapshot());
  PERSONAL_KEYS.forEach(remove);
  remove("owner");
}

// Runs synchronously whenever a signed-in user is known, before any network call.
// Anonymous data present at sign-in is adopted by this account (the consent text says so).
export function claimDevice(userId) {
  const owner = load("owner", null);
  if (owner === userId) return;
  if (owner) releaseDevice(); // stale owner, e.g. a session that ended without our sign-out handler
  const mine = load(`stash:${userId}`, null);
  if (mine) {
    const current = getResults();
    const ids = new Set(current.map((r) => r.id));
    save("results", [...current, ...(mine.results || []).filter((r) => !ids.has(r.id))].sort((x, y) => y.date.localeCompare(x.date)).slice(0, 300));
    const progress = { ...(mine.progress || {}) };
    for (const [k, v] of Object.entries(getProgress())) if (!progress[k] || v.correct > progress[k].correct) progress[k] = v;
    save("progress", progress);
    for (const k of ["chat", "aiCache", "aiConsent"]) if (load(k, null) === null && mine[k] !== null) save(k, mine[k]);
    remove(`stash:${userId}`);
  }
  save("owner", userId);
}

export async function fetchProfile(userId) {
  const { data, error } = await supabase.from("profiles").select("health_consent_at, consent_version, created_at").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function setHealthConsent(userId, on, version) {
  const patch = on ? { health_consent_at: new Date().toISOString(), consent_version: version } : { health_consent_at: null, consent_version: null };
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw error;
  // Withdrawing consent erases the stored results (GDPR Art. 7(3) and 17).
  if (!on) {
    const { error: delError } = await supabase.from("results").delete().eq("user_id", userId);
    if (delError) throw delError;
  }
}

const toRow = (userId, e) => ({ user_id: userId, client_id: e.id, test_id: e.testId, taken_at: e.date, result: e.result });

export async function pushResult(userId, entry) {
  const { error } = await supabase.from("results").upsert(toRow(userId, entry), { onConflict: "user_id,client_id", ignoreDuplicates: true });
  if (error) throw error;
}

export async function removeResult(userId, clientId) {
  const { error } = await supabase.from("results").delete().eq("user_id", userId).eq("client_id", clientId);
  if (error) throw error;
}

export async function pushProgress(userId, lessonId, p) {
  const { error } = await supabase
    .from("progress")
    .upsert({ user_id: userId, lesson_id: lessonId, correct: p.correct, total: p.total, updated_at: p.date }, { onConflict: "user_id,lesson_id" });
  if (error) throw error;
}

// Two-way merge on sign-in. Nothing is ever deleted here; deletions are explicit actions.
export async function mergeAll(userId, consent) {
  claimDevice(userId); // idempotent; normally already done by AuthProvider
  const [{ data: remoteProgress, error: pErr }, remoteResults] = await Promise.all([
    supabase.from("progress").select("lesson_id, correct, total, updated_at").eq("user_id", userId),
    consent ? supabase.from("results").select("client_id, test_id, taken_at, result").eq("user_id", userId) : Promise.resolve({ data: [] }),
  ]);
  if (pErr) throw pErr;
  if (remoteResults.error) throw remoteResults.error;

  // Progress: keep the best score per lesson on both sides.
  const local = getProgress();
  const merged = { ...local };
  for (const r of remoteProgress) {
    const l = local[r.lesson_id];
    if (!l || r.correct > l.correct) merged[r.lesson_id] = { correct: r.correct, total: r.total, date: r.updated_at };
  }
  save("progress", merged);
  const remoteById = Object.fromEntries(remoteProgress.map((r) => [r.lesson_id, r]));
  const progressUploads = Object.entries(merged).filter(([id, p]) => !remoteById[id] || p.correct > remoteById[id].correct);
  if (progressUploads.length) {
    const { error } = await supabase
      .from("progress")
      .upsert(progressUploads.map(([id, p]) => ({ user_id: userId, lesson_id: id, correct: p.correct, total: p.total, updated_at: p.date })), { onConflict: "user_id,lesson_id" });
    if (error) throw error;
  }

  if (!consent) return;
  const localResults = getResults();
  const localIds = new Set(localResults.map((r) => r.id));
  const remoteIds = new Set(remoteResults.data.map((r) => r.client_id));
  const incoming = remoteResults.data
    .filter((r) => !localIds.has(r.client_id) && KNOWN_TYPES.includes(r.result?.type))
    .map((r) => ({ id: r.client_id, testId: r.test_id, date: r.taken_at, result: r.result }));
  if (incoming.length) save("results", [...localResults, ...incoming].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 300));
  const outgoing = localResults.filter((r) => !remoteIds.has(r.id));
  if (outgoing.length) {
    const { error } = await supabase.from("results").upsert(outgoing.map((e) => toRow(userId, e)), { onConflict: "user_id,client_id", ignoreDuplicates: true });
    if (error) throw error;
  }
}

// Everything we hold about the user, for GDPR Art. 15/20 requests.
export async function exportAccount(userId, email) {
  const [profile, results, progress] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("results").select("*").eq("user_id", userId),
    supabase.from("progress").select("*").eq("user_id", userId),
  ]);
  return JSON.stringify(
    { exportedAt: new Date().toISOString(), account: { id: userId, email }, profile: profile.data, results: results.data, progress: progress.data, onThisDevice: { results: getResults(), progress: getProgress(), chat: load("chat", []) } },
    null,
    2
  );
}
