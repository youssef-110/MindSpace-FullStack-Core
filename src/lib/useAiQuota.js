import { useEffect, useState } from "react";
import { aiStatus } from "./ai";
import { useAuth } from "./auth-context";

// Current AI quota for the signed-in user; refreshed by every AI response.
export function useAiQuota() {
  const { user } = useAuth();
  const [quota, setQuota] = useState(null);

  useEffect(() => {
    if (!user) return;
    let live = true;
    aiStatus().then(
      (s) => live && setQuota({ remaining: s.userRemaining, limit: s.userLimit, saver: s.saver, globalExhausted: s.globalExhausted }),
      () => {}
    );
    const onQuota = (e) => setQuota((q) => ({ ...q, ...e.detail }));
    window.addEventListener("mindspace:ai-quota", onQuota);
    return () => {
      live = false;
      window.removeEventListener("mindspace:ai-quota", onQuota);
    };
  }, [user]);

  return user ? quota : null;
}
