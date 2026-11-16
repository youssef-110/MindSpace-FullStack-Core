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
import { Icon, PageHeader } from "../components/ui";

const SYNC_TEXT = { idle: "Not synced yet", syncing: "Syncing…", synced: "Up to date", error: "Couldn't sync. We'll retry when you reload." };
const SYNC_TAG = { idle: "", syncing: "tag-brand", synced: "tag-good", error: "tag-alert" };

// Card titles are Inter, not the display serif (DESIGN.md: serif never below 28px).
function Section({ title, icon, danger = false, children }) {
  return (
    <section className={`card p-5 sm:p-7 ${danger ? "border-rose/40" : ""}`}>
      <h2 className={`flex items-center gap-2.5 font-sans text-lg font-semibold tracking-[-0.02em] ${danger ? "text-rose" : ""}`}>
        <Icon name={icon} size={20} className={danger ? "" : "text-ink-3"} />
        {title}
      </h2>
      <div className="mt-3 grid justify-items-start gap-3">{children}</div>
    </section>
  );
}

function GroupLabel({ children }) {
  return <p className="eyebrow mb-3 mt-10 px-1">{children}</p>;
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
    <form onSubmit={submit} className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <label className="field flex-1">
        New password
        <input type="password" required minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className="input" />
      </label>
      <button className="btn btn-ghost" disabled={busy || pw.length < 8}>Save password</button>
      {msg && <p className="text-sm font-medium text-ink sm:basis-full" role="status">{msg}</p>}
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
      return setMsg("Couldn't delete the account. Try again, or use the contact form.");
    }
    await supabase.auth.signOut();
    clearDeviceData();
    navigate("/", { replace: true });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader className="!mb-8" title="Your account">
        <p className="lead mt-4 break-all">{user.email}</p>
      </PageHeader>

      {recovery && (
        <div className="card mb-4 border-brand/50 p-5 sm:p-7">
          <h2 className="font-sans text-lg font-semibold tracking-[-0.02em]">Choose a new password</h2>
          <div className="mt-3"><NewPassword onDone={clearRecovery} /></div>
        </div>
      )}

      <div aria-live="polite">
        {msg && (
          <p className="well mb-4 flex items-start gap-2.5 p-4 font-medium text-ink">
            <Icon name="info" size={20} className="mt-0.5 text-ink-3" />
            {msg}
          </p>
        )}
      </div>

      <div className="grid gap-4">
        <Section title="Progress" icon="chart">
          <p>
            <span className="num">{getResults().length}</span> saved result{getResults().length === 1 ? "" : "s"} and <span className="num">{done}</span> of {lessons.length} lessons completed.{" "}
            <Link to="/results" className="link">See your progress</Link>
          </p>
          <p className="flex flex-wrap items-center gap-2 text-sm text-ink-3" role="status">
            Sync status: <span className={`tag ${SYNC_TAG[syncState] ?? ""}`}>{SYNC_TEXT[syncState]}</span>
          </p>
        </Section>

        <GroupLabel>Privacy and data</GroupLabel>
        <Section title="Save test results to your account" icon="lock">
          <p>
            {consent
              ? `On since ${new Date(profile.health_consent_at).toLocaleDateString()}. Your results are stored in an EU data centre and follow you to any device you sign in on.`
              : "Off. Your results stay only in this browser. Lesson progress still syncs."}
          </p>
          <p className="text-sm text-ink-3">
            Some results relate to mental health, which EU law treats as sensitive data. Turning this on is your explicit consent to store your
            results in your account, including those already on this device. Turning it off withdraws consent and deletes them from your account.
          </p>
          <button className={`btn whitespace-normal py-2 ${consent ? "border-[1.5px] border-rose/50 text-rose hover:bg-rose-soft" : "btn-ghost"}`} onClick={toggleConsent} disabled={busy === "consent" || !profile}>
            {consent ? "Turn off and delete stored results" : "Turn on result syncing"}
          </button>
        </Section>

        <Section title="AI usage" icon="spark">
          <QuotaBadge quota={quota} />
          {aiConsent && (
            <button className="btn btn-ghost" onClick={() => { remove("aiConsent"); setAiConsent(false); setMsg("AI consent withdrawn. You'll be asked again before using the AI."); }}>
              Withdraw AI consent
            </button>
          )}
          <p className="text-sm text-ink-3">Each account has a daily number of AI requests so the AI stays available for everyone.</p>
        </Section>

        <Section title="Your data" icon="download">
          <p>Download everything stored in your account and on this device, as a JSON file.</p>
          <button className="btn btn-ghost" onClick={download} disabled={busy === "export"}>
            <Icon name="download" size={18} />
            {busy === "export" ? "Preparing…" : "Download my data"}
          </button>
        </Section>

        <GroupLabel>Security</GroupLabel>
        {!recovery && (
          <Section title="Password" icon="shield">
            <NewPassword />
          </Section>
        )}

        <Section title="Sign out" icon="user">
          <div className="flex flex-wrap gap-3">
            <button className="btn btn-dark" onClick={() => signOut(false)}>Sign out</button>
            <button className="btn btn-ghost whitespace-normal py-2" onClick={() => signOut(true)}>Sign out and clear this device</button>
          </div>
          <p className="text-sm text-ink-3">
            Signing out hides your results, progress and chats on this device until you sign in again. On a shared device, choose "clear this device" to
            remove them completely.
          </p>
        </Section>

        <GroupLabel>Danger zone</GroupLabel>
        <Section title="Delete account" icon="trash" danger>
          <p>Permanently deletes your account, stored results, progress and AI usage records. This can't be undone.</p>
          <button className="btn border-[1.5px] border-rose/50 text-rose hover:bg-rose-soft" onClick={deleteAccount} disabled={busy === "delete"}>
            <Icon name="trash" size={18} />
            {busy === "delete" ? "Deleting…" : "Delete my account"}
          </button>
        </Section>
      </div>
    </div>
  );
}
