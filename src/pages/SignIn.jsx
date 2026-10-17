import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth-context";
import { setHealthConsent } from "../lib/sync";
import { CONSENT_VERSION, MIN_AGE, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "../lib/config";

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

  const field = "mt-1.5 block min-h-[48px] w-full rounded-[8px] border border-line bg-surface px-3.5 text-base focus:border-brand";
  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="text-4xl font-semibold">{MODES[mode]}</h1>
      <p className="mt-2 text-ink-2">
        {mode === "up"
          ? "An account lets you use the AI and, if you choose, keep your results and progress across devices."
          : mode === "reset"
            ? "Enter your email and we'll send you a link to choose a new password."
            : "Welcome back. Your progress syncs as soon as you sign in."}
      </p>

      {mode !== "reset" && (
        <div className="mt-6 grid grid-cols-2 rounded-[10px] bg-sunken p-1" role="tablist" aria-label="Account">
          {["in", "up"].map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => { setMode(m); setError(""); setNotice(""); }}
              className={`min-h-[44px] rounded-[7px] text-sm font-bold transition-colors ${mode === m ? "bg-surface text-ink shadow-[var(--shadow)]" : "text-ink-2"}`}
            >
              {MODES[m]}
            </button>
          ))}
        </div>
      )}

      {mode !== "reset" && !notice && googleOn && (
        <div className="mt-6">
          <button type="button" onClick={google} className="btn btn-quiet w-full gap-3 bg-surface">
            <GoogleG /> Continue with Google
          </button>
          <p className="mt-2 text-sm text-ink-2">
            By continuing with Google you confirm you're {MIN_AGE} or older and accept the <Link to="/terms" className="link">terms</Link> and{" "}
            <Link to="/privacy" className="link">privacy notice</Link>.
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-ink-2" aria-hidden="true">
            <span className="h-px flex-1 bg-line" /> or with email <span className="h-px flex-1 bg-line" />
          </div>
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
