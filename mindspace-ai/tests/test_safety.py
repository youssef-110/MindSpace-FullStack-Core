import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from safety import detect_crisis, CRISIS_PREFIX
from prompts import build_messages, SYSTEM_PROMPT


class TestCrisisDetection:
    def test_detects_explicit_suicidal_language(self):
        assert detect_crisis("I want to kill myself")
        assert detect_crisis("I've been thinking about suicide")
        assert detect_crisis("i just want to end my life")
        assert detect_crisis("everyone would be better off dead without me... i mean me being dead")

    def test_detects_self_harm(self):
        assert detect_crisis("I've been cutting myself again")
        assert detect_crisis("thoughts of hurting myself")
        assert detect_crisis("relapsed into self-harm")

    def test_detects_indirect_phrasing(self):
        assert detect_crisis("I don't want to be alive anymore")
        assert detect_crisis("I can't take it anymore")
        assert detect_crisis("i want to unalive")

    def test_ignores_ordinary_distress(self):
        assert not detect_crisis("I'm feeling really sad today")
        assert not detect_crisis("work is stressing me out so much")
        assert not detect_crisis("my anxiety was bad this morning")
        assert not detect_crisis("")
        assert not detect_crisis(None)

    def test_prefix_contains_hotlines(self):
        assert "988" in CRISIS_PREFIX
        assert "741741" in CRISIS_PREFIX


class TestPromptBuilding:
    def test_system_message_first(self):
        msgs = build_messages("hello", [])
        assert msgs[0]["role"] == "system"
        assert SYSTEM_PROMPT in msgs[0]["content"]
        assert msgs[-1] == {"role": "user", "content": "hello"}

    def test_history_role_mapping(self):
        history = [
            {"role": "user", "content": "hi"},
            {"role": "ai", "content": "hello there"},
        ]
        msgs = build_messages("next", history)
        assert msgs[1] == {"role": "user", "content": "hi"}
        assert msgs[2] == {"role": "assistant", "content": "hello there"}

    def test_context_injected_into_system(self):
        msgs = build_messages("q", [], context="ABC model of CBT")
        assert "ABC model of CBT" in msgs[0]["content"]

    def test_mood_context_included(self):
        moods = [{"date": "1/2/2026", "mood": 2, "tags": ["anxious"]}]
        msgs = build_messages("q", [], mood_context=moods)
        assert "mood 2/5" in msgs[0]["content"]
        assert "anxious" in msgs[0]["content"]

    def test_empty_history_entries_skipped(self):
        msgs = build_messages("q", [{"role": "user", "content": ""}])
        assert len(msgs) == 2  # system + current user message
