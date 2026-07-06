"""Server-side crisis detection and safety response for the MindSpace Companion.

High-recall by design: gently offering crisis resources when they're not needed
costs almost nothing; missing someone who needs them costs everything.
"""
import re

CRISIS_PATTERNS = [
    r"suicid",
    r"kill (myself|me)\b",
    r"end (my life|it all)",
    r"\bunalive\b",
    r"want(ing)? to die",
    r"don'?t want to (live|be alive|exist)",
    r"better off dead",
    r"no reason to (live|go on)",
    r"hurt(ing)? myself",
    r"self[- ]?harm",
    r"cut(ting)? myself",
    r"\boverdose\b",
    r"can'?t (go on|do this anymore|take it anymore)",
]

_COMPILED = [re.compile(p, re.IGNORECASE) for p in CRISIS_PATTERNS]


def detect_crisis(text: str) -> bool:
    if not text:
        return False
    return any(p.search(text) for p in _COMPILED)


CRISIS_PREFIX = (
    "Before anything else: it sounds like you might be carrying something really heavy right now, "
    "and I want you to know that you deserve real, immediate support from a human. "
    "Please consider reaching out right now:\n\n"
    "- **988 Suicide & Crisis Lifeline** — call or text 988 (US), free and confidential, 24/7\n"
    "- **Crisis Text Line** — text HOME to 741741 (US/CA) or 85258 (UK)\n"
    "- **Emergency services** — 911 / 112 / your local number if you're in immediate danger\n"
    "- International directory: iasp.info/resources/Crisis_Centres\n\n"
    "I'm still here with you, and we can keep talking.\n\n"
)
