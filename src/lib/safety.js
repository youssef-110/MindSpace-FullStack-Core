// Client-side crisis detection. Deliberately high-recall: it's better to gently
// offer resources when they're not needed than to miss someone who needs them.

const CRISIS_PATTERNS = [
  /suicid/i,
  /kill (myself|me)/i,
  /end (my|it all|my life)/i,
  /\bunalive\b/i,
  /want(ing)? to die/i,
  /don'?t want to (live|be alive|exist)/i,
  /better off dead/i,
  /no reason to (live|go on)/i,
  /hurt(ing)? myself/i,
  /self[- ]?harm/i,
  /cut(ting)? myself/i,
  /overdose/i,
  /can'?t (go on|do this anymore|take it anymore)/i,
];

export function detectCrisis(text) {
  if (!text) return false;
  return CRISIS_PATTERNS.some((p) => p.test(text));
}

export const crisisResources = [
  {
    name: "988 Suicide & Crisis Lifeline (US)",
    contact: "Call or text 988",
    note: "Free, confidential, 24/7 support for people in distress.",
  },
  {
    name: "Crisis Text Line",
    contact: "Text HOME to 741741 (US/CA) or 85258 (UK)",
    note: "Text with a trained crisis counselor, 24/7.",
  },
  {
    name: "Find a helpline (any country)",
    contact: "findahelpline.com",
    note: "Free, verified directory of crisis lines worldwide.",
  },
  {
    name: "Emergency services",
    contact: "911 (US) · 112 (EU) · your local emergency number",
    note: "If you are in immediate danger, please call now.",
  },
];

export const CRISIS_MESSAGE =
  "It sounds like you might be carrying something really heavy right now, and you deserve support from a real person. " +
  "Please reach out now: call or text 988 (US & Canada), text HOME to 741741 (US) or 85258 (UK), " +
  "or call your local emergency number (911 / 112) if you're in immediate danger. " +
  "Outside the US, find a line at findahelpline.com. I'm still here and we can keep talking.";
