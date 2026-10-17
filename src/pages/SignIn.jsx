import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth-context";
import { setHealthConsent } from "../lib/sync";
import { CONSENT_VERSION, MIN_AGE } from "../lib/config";

const MODES = { in: "Sign in", up: "Create account", reset: "Reset password" };

// Only same-site paths are allowed as a return target (no open redirect).
const safeNext = (n) => (typeof n === "string" && n.startsWith("/") && !n.startsWith("//") && !n.includes("\\") ? n : "/account");

function friendly(error) {
  const m = error?.message || "";
  if (/invalid login credentials/i.test(m)) return "That email and password don't match. Check them, or reset your password.";
  if (/email not confirmed/i.test(m)) return "Confirm your email first: open the link we sent you, then sign in.";
  if (/already registered|already been registered/i.test(m)) return "There's already an account with this email. Sign in instead.";
  if (/rate limit|too many/i.test(m)) return "Too many attempts for now. Wait a few minutes and try again.";
  if (/password/i.test(m) && /characters|weak|short/i.test(m)) return "Choose a longer password: at least 8 characters, ideally a phrase.";
  return m || "Something went wrong. Try again.";
}

export default function SignIn() {
  const { user, ready, refreshProfile } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = safeNext(params.get("next"));
  const [mode, setMode] = useState("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [saveResults, setSaveResults] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  if (ready && user && !notice) return <Navigate to={next} replace />;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate(next, { replace: true });
      } else if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/account`, data: { consent_version: CONSENT_VERSION } },
        });
        if (error) throw error;
        if (data.session) {
          if (saveResults) await setHealthConsent(data.user.id, true, CONSENT_VERSION);
          await refreshProfile();
          navigate(next, { replace: true });
        } else {
          setNotice(`We sent a confirmation link to ${email}. Open it to finish creating your account.${saveResults ? " You can turn on result syncing from your account page afterwards." : ""}`);
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/account` });
        if (error) throw error;
        setNotice(`If an account exists for ${email}, a reset link is on its way.`);
      }
    } catch (err) {
      setError(friendly(err));
    } finally {
      setBusy(false);
    }
  }

  const field = "mt-1.5 block min-h-[48px] w-full rounded-[10px] border border-line bg-surface px-3.5 text-base focus:border-brand";
  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="text-4xl font-extrabold">{MODES[mode]}</h1>
      <p className="mt-2 text-ink-2">
        {mode === "up"
          ? "An account lets you use the AI and, if you choose, keep your results and progress across devices."
          : mode === "reset"
            ? "Enter your email and we'll send you a link to choose a new password."
            : "Welcome back. Your progress syncs as soon as you sign in."}
      </p>

      {mode !== "reset" && (
        <div className="mt-6 grid grid-cols-2 rounded-[12px] bg-sunken p-1" role="tablist" aria-label="Account">
          {["in", "up"].map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => { setMode(m); setError(""); setNotice(""); }}
              className={`min-h-[44px] rounded-[9px] text-sm font-bold transition-colors ${mode === m ? "bg-surface text-ink shadow-[var(--shadow)]" : "text-ink-2"}`}
            >
              {MODES[m]}
            </button>
          ))}
        </div>
      )}

      {notice ? (
        <div className="mt-6 rounded-[var(--r-md)] border border-line bg-surface p-5" role="status">
          <p>{notice}</p>
          <p className="mt-2 text-sm text-ink-2">Can't find it? Check your spam folder.</p>
          <button className="btn btn-quiet mt-4" onClick={() => { setNotice(""); setMode("in"); }}>Back to sign in</button>
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={submit} noValidate={false}>
          <label className="block">
            <span className="font-bold">Email</span>
            <input className={field} type="email" required autoComplete="email" inputMode="email" autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          {mode !== "reset" && (
            <label className="block">
              <span className="font-bold">Password</span>
              <input
                className={field}
                type="password"
                required
                minLength={8}
                autoComplete={mode === "up" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {mode === "up" && <span className="mt-1 block text-sm text-ink-2">At least 8 characters.</span>}
            </label>
          )}

          {mode === "up" && (
            <div className="space-y-3 rounded-[var(--r-md)] bg-sunken p-4 text-[0.95rem]">
              <label className="flex items-start gap-3">
                <input type="checkbox" required className="mt-1 h-5 w-5 shrink-0 accent-[var(--brand)]" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span>
                  I'm {MIN_AGE} or older, I accept the <Link to="/terms" className="link">terms</Link>, and I've read the{" "}
                  <Link to="/privacy" className="link">privacy policy</Link>.
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[var(--brand)]" checked={saveResults} onChange={(e) => setSaveResults(e.target.checked)} />
                <span>
                  <strong>Optional:</strong> I explicitly consent to my test results, including results already on this device, being stored in my account.
                  Some results relate to mental health. I can withdraw this any time, which deletes them from my account.
                </span>
              </label>
            </div>
          )}

          {error && <p className="font-bold text-rose" role="alert">{error}</p>}
          <button className="btn btn-primary w-full" disabled={busy || (mode === "up" && !agree)}>
            {busy ? "Please wait…" : MODES[mode]}
          </button>
        </form>
      )}

      <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm">
        {mode === "in" && !notice && <button className="link" onClick={() => { setMode("reset"); setError(""); }}>Forgot your password?</button>}
        {mode === "reset" && <button className="link" onClick={() => setMode("in")}>Back to sign in</button>}
        <span className="text-ink-2">Everything works without an account too.</span>
      </div>
    </div>
  );
}
