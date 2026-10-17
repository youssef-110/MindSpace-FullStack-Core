import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth-context";
import { useAiQuota } from "../lib/useAiQuota";
import { setHealthConsent, exportAccount } from "../lib/sync";
import { clearDeviceData, getResults, getProgress, load, remove } from "../lib/storage";
import { CONSENT_VERSION } from "../lib/config";
import { lessons } from "../lib/learn";
import { QuotaBadge } from "../components/AiAccess";

const SYNC_TEXT = { idle: "Not synced yet", syncing: "Syncing…", synced: "Up to date", error: "Couldn't sync. We'll retry when you reload." };

function Section({ title, children }) {
  return (
    <section className="border-t border-line py-7">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function NewPassword({ onDone }) {
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setMsg(error.message);
    setMsg("Password updated.");
    setPw("");
    onDone?.();
  }
  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="block flex-1">
        <span className="text-sm font-bold">New password</span>
        <input type="password" required minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1.5 block min-h-[48px] w-full rounded-[10px] border border-line bg-surface px-3.5 text-base focus:border-brand" />
      </label>
      <button className="btn btn-quiet" disabled={busy || pw.length < 8}>Save password</button>
      {msg && <p className="text-sm font-bold sm:basis-full" role="status">{msg}</p>}
    </form>
  );
}

export default function Account() {
  const { user, ready, profile, consent, syncState, refreshProfile, recovery, clearRecovery } = useAuth();
  const quota = useAiQuota();
  const navigate = useNavigate();
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [aiConsent, setAiConsent] = useState(() => Boolean(load("aiConsent", null)));

  if (ready && !user) return <Navigate to="/signin?next=/account" replace />;
  if (!user) return <div className="py-32" aria-busy="true" />;

  const done = lessons.filter((l) => getProgress()[l.id]).length;

  async function toggleConsent() {
    if (consent && !confirm("Turn off result syncing? This deletes the results stored in your account. Results on this device stay.")) return;
    setBusy("consent");
    try {
      await setHealthConsent(user.id, !consent, CONSENT_VERSION);
      await refreshProfile();
      setMsg(consent ? "Result syncing is off and your stored results were deleted." : "Result syncing is on. Your results are now saved to your account.");
    } catch {
      setMsg("That didn't work. Check your connection and try again.");
    }
    setBusy("");
  }

  async function download() {
    setBusy("export");
    try {
      const url = URL.createObjectURL(new Blob([await exportAccount(user.id, user.email)], { type: "application/json" }));
      Object.assign(document.createElement("a"), { href: url, download: "mindspace-my-data.json" }).click();
      URL.revokeObjectURL(url);
    } catch {
      setMsg("Couldn't prepare your data. Try again.");
    }
    setBusy("");
  }

  async function signOut(clear) {
    await supabase.auth.signOut();
    if (clear) clearDeviceData();
    navigate("/", { replace: true });
  }

  async function deleteAccount() {
    if (prompt(`This permanently deletes your account and everything stored in it. Type DELETE to confirm.`) !== "DELETE") return;
    setBusy("delete");
    const { error } = await supabase.rpc("delete_my_account");
    if (error) {
      setBusy("");
      return setMsg("Couldn't delete the account. Try again, or contact us from the privacy page.");
    }
    await supabase.auth.signOut();
    clearDeviceData();
    navigate("/", { replace: true });
  }

  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="text-4xl sm:text-5xl font-extrabold">Your account</h1>
      <p className="mt-2 break-all text-ink-2">{user.email}</p>

      {recovery && (
        <div className="mt-6 rounded-[var(--r-md)] border-2 border-brand/40 bg-surface p-5">
          <h2 className="text-lg font-bold">Choose a new password</h2>
          <div className="mt-3"><NewPassword onDone={clearRecovery} /></div>
        </div>
      )}

      {msg && <p className="mt-6 rounded-[var(--r-md)] bg-sunken p-4 font-bold" role="status">{msg}</p>}

      <div className="mt-8">
        <Section title="Progress">
          <p className="text-ink-2">
            {getResults().length} saved result{getResults().length === 1 ? "" : "s"} and {done} of {lessons.length} lessons completed.{" "}
            <Link to="/results" className="link">See your progress</Link>
          </p>
          <p className="text-sm text-ink-2">Sync status: {SYNC_TEXT[syncState]}</p>
        </Section>

        <Section title="Save test results to your account">
          <p className="text-ink-2">
            {consent
              ? `On since ${new Date(profile.health_consent_at).toLocaleDateString()}. Your results are stored in an EU data centre and follow you to any device you sign in on.`
              : "Off. Your results stay only in this browser. Lesson progress still syncs."}
          </p>
          <p className="text-sm text-ink-2">
            Some results relate to mental health, which EU law treats as sensitive data. Turning this on is your explicit consent to store your
            results in your account, including those already on this device. Turning it off withdraws consent and deletes them from your account.
          </p>
          <button className="btn btn-quiet" onClick={toggleConsent} disabled={busy === "consent" || !profile}>
            {consent ? "Turn off and delete stored results" : "Turn on result syncing"}
          </button>
        </Section>

        <Section title="AI usage">
          <QuotaBadge quota={quota} />
          {aiConsent && (
            <button className="btn btn-quiet" onClick={() => { remove("aiConsent"); setAiConsent(false); setMsg("AI consent withdrawn. You'll be asked again before using the AI."); }}>
              Withdraw AI consent
            </button>
          )}
          <p className="text-sm text-ink-2">Each account has a daily number of AI requests so the AI stays available for everyone.</p>
        </Section>

        {!recovery && (
          <Section title="Password">
            <NewPassword />
          </Section>
        )}

        <Section title="Your data">
          <p className="text-ink-2">Download everything stored in your account and on this device, as a JSON file.</p>
          <button className="btn btn-quiet" onClick={download} disabled={busy === "export"}>Download my data</button>
        </Section>

        <Section title="Sign out">
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-quiet" onClick={() => signOut(false)}>Sign out</button>
            <button className="btn btn-quiet" onClick={() => signOut(true)}>Sign out and clear this device</button>
          </div>
          <p className="text-sm text-ink-2">On a shared device, choose "clear this device" to remove your results, progress and chats from this browser.</p>
        </Section>

        <Section title="Delete account">
          <p className="text-ink-2">Permanently deletes your account, stored results, progress and AI usage records. This can't be undone.</p>
          <button className="btn btn-quiet text-rose" onClick={deleteAccount} disabled={busy === "delete"}>Delete my account</button>
        </Section>
      </div>
    </div>
  );
}
