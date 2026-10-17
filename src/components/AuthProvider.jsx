import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "../lib/auth-context";
import { fetchProfile, mergeAll, pushResult, removeResult, pushProgress, claimDevice, releaseDevice } from "../lib/sync";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [syncState, setSyncState] = useState("idle"); // idle | syncing | synced | error

  useEffect(() => {
    // Device ownership is settled synchronously, before React renders any personal data for the user.
    const apply = (event, session) => {
      if (session?.user) claimDevice(session.user.id);
      else if (event === "SIGNED_OUT") releaseDevice();
      setUser(session?.user ?? null);
    };
    supabase.auth.getSession().then(({ data }) => {
      apply("INITIAL_SESSION", data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      apply(event, session);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const consent = Boolean(profile?.health_consent_at);

  const refreshProfile = useCallback(async () => {
    if (!user) return setProfile(null);
    setSyncState("syncing");
    try {
      const p = await fetchProfile(user.id);
      setProfile(p);
      await mergeAll(user.id, Boolean(p?.health_consent_at));
      setSyncState("synced");
    } catch (e) {
      console.error("[sync]", e);
      setSyncState("error");
    }
  }, [user]);

  useEffect(() => {
    // Deferred so the merge never runs inside the auth callback (supabase-js lock).
    const t = setTimeout(refreshProfile, 0);
    return () => clearTimeout(t);
  }, [refreshProfile]);

  // Mirror local changes to the account as they happen.
  useEffect(() => {
    if (!user) return;
    const guard = (fn) => (e) =>
      fn(e.detail).then(
        () => setSyncState("synced"),
        (err) => {
          console.error("[sync]", err);
          setSyncState("error");
        }
      );
    const onSaved = guard((entry) => (consent ? pushResult(user.id, entry) : Promise.resolve()));
    const onDeleted = guard((id) => (consent ? removeResult(user.id, id) : Promise.resolve()));
    const onProgress = guard((p) => pushProgress(user.id, p.lessonId, p));
    window.addEventListener("mindspace:result-saved", onSaved);
    window.addEventListener("mindspace:result-deleted", onDeleted);
    window.addEventListener("mindspace:progress-saved", onProgress);
    return () => {
      window.removeEventListener("mindspace:result-saved", onSaved);
      window.removeEventListener("mindspace:result-deleted", onDeleted);
      window.removeEventListener("mindspace:progress-saved", onProgress);
    };
  }, [user, consent]);

  const value = useMemo(
    () => ({ user, profile, consent, ready, recovery, clearRecovery: () => setRecovery(false), syncState, refreshProfile }),
    [user, profile, consent, ready, recovery, syncState, refreshProfile]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
