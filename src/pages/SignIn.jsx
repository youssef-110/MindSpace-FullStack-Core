import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth-context";
import { setHealthConsent } from "../lib/sync";
import { motion } from "framer-motion";
import { CONSENT_VERSION, MIN_AGE, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "../lib/config";
import { Icon, PageHeader } from "../components/ui";

// Official multicolour Google "G", as required by Google's sign-in branding guidelines.
function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

// Show the Google button only when the provider is switched on in Supabase, so it never leads to an error page.
function useGoogleEnabled() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_PUBLISHABLE_KEY } })
      .then((r) => r.json())
      .then((j) => setOn(Boolean(j.external?.google)))
      .catch(() => setOn(false));
  }, []);
  return on;
}

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
  const googleOn = useGoogleEnabled();

  async function google() {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}${next}` } });
    if (error) setError(friendly(error));
  }

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

  return (
    <div className="mx-auto max-w-md">
      <PageHeader
        className="!mb-8"
        title={MODES[mode]}
        lead={
          mode === "up"
            ? "An account lets you use the AI and, if you choose, keep your results and progress across devices."
            : mode === "reset"
              ? "Enter your email and we'll send you a link to choose a new password."
              : "Welcome back. Your progress syncs as soon as you sign in."
        }
      />

      <div className="card p-5 sm:p-7">
      {mode !== "reset" && (
        <div className="grid grid-cols-2 rounded-full bg-sunken p-1" role="tablist" aria-label="Account">
          {["in", "up"].map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => { setMode(m); setError(""); setNotice(""); }}
              className={`relative min-h-11 rounded-full text-sm font-semibold transition-colors ${mode === m ? "text-ink" : "text-ink-3 hover:text-ink"}`}
            >
              {mode === m && <motion.span layoutId="auth-tab" className="absolute inset-0 rounded-full border border-line bg-surface" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
              <span className="relative">{MODES[m]}</span>
            </button>
          ))}
        </div>
      )}

      {mode !== "reset" && !notice && googleOn && (
        <div className="mt-6">
          <button type="button" onClick={google} className="btn btn-ghost w-full gap-3">
            <GoogleG /> Continue with Google
          </button>
          <p className="mt-3 text-sm text-ink-3">
            By continuing with Google you confirm you're {MIN_AGE} or older and accept the <Link to="/terms" className="link">terms</Link> and{" "}
            <Link to="/privacy" className="link">privacy notice</Link>.
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-ink-3" aria-hidden="true">
            <span className="h-px flex-1 bg-line" /> or with email <span className="h-px flex-1 bg-line" />
          </div>
        </div>
      )}

      {notice ? (
        <div className={mode === "reset" ? "" : "mt-6"} role="status">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand-text">
            <Icon name="check" />
          </span>
          <p className="mt-4 font-medium text-ink">{notice}</p>
          <p className="mt-2 text-sm text-ink-3">Can't find it? Check your spam folder.</p>
          <button type="button" className="btn btn-ghost mt-5" onClick={() => { setNotice(""); setMode("in"); }}>Back to sign in</button>
        </div>
      ) : (
        <form className={`grid gap-4 ${mode === "reset" ? "" : "mt-6"}`} onSubmit={submit} noValidate={false} aria-describedby={error ? "auth-error" : undefined}>
          <label className="field">
            Email
            <input className="input" type="email" required autoComplete="email" inputMode="email" autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          {mode !== "reset" && (
            <label className="field">
              Password
              <input
                className="input"
                type="password"
                required
                minLength={8}
                autoComplete={mode === "up" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {mode === "up" && <span className="font-normal text-ink-3">At least 8 characters.</span>}
            </label>
          )}

          {mode === "up" && (
            <div className="well grid gap-4 p-4 text-[0.9375rem]">
              <label className="flex items-start gap-3">
                <input type="checkbox" required className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--brand)]" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span>
                  I'm {MIN_AGE} or older, I accept the <Link to="/terms" className="link">terms</Link>, and I've read the{" "}
                  <Link to="/privacy" className="link">privacy policy</Link>.
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--brand)]" checked={saveResults} onChange={(e) => setSaveResults(e.target.checked)} />
                <span>
                  <strong>Optional:</strong> I explicitly consent to my test results, including results already on this device, being stored in my account.
                  Some results relate to mental health. I can withdraw this any time, which deletes them from my account.
                </span>
              </label>
            </div>
          )}

          {error && (
            <p id="auth-error" className="flex items-start gap-2 rounded-[var(--r-md)] bg-rose-soft p-3.5 text-sm font-medium text-rose" role="alert">
              <Icon name="alert" size={20} />
              {error}
            </p>
          )}
          <button className="btn btn-primary w-full" disabled={busy || (mode === "up" && !agree)}>
            {busy ? "Please wait…" : MODES[mode]}
          </button>
        </form>
      )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1 text-sm">
        {mode === "in" && !notice && <button type="button" className="link min-h-11" onClick={() => { setMode("reset"); setError(""); }}>Forgot your password?</button>}
        {mode === "reset" && <button type="button" className="link min-h-11" onClick={() => setMode("in")}>Back to sign in</button>}
        <span className="text-ink-3">Everything works without an account too.</span>
      </div>
    </div>
  );
}
