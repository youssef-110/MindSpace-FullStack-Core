import { useState } from "react";
import { load, save } from "./storage";
import { CONSENT_VERSION } from "./config";

// Explicit consent (GDPR Art. 9(2)(a)) before anything is sent to the AI provider. Versioned, so a
// material change to the wording asks again. Withdraw by clearing it from the account page.
export function useAiNotice() {
  const [accepted, setAccepted] = useState(() => load("aiConsent", null)?.version === CONSENT_VERSION);
  const accept = () => {
    save("aiConsent", { version: CONSENT_VERSION, at: new Date().toISOString() });
    setAccepted(true);
  };
  return [accepted, accept];
}
