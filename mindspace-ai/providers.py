"""LLM provider layer supporting Groq, Anthropic Claude, and local Ollama.

Priority:
  1. Groq (High-speed LLaMA-3.3-70B / LLaMA-3.1-8B) if GROQ_API_KEY is set.
  2. Anthropic Claude if ANTHROPIC_API_KEY is set.
  3. Local Ollama (default: llama3).
  4. Intelligent clinical offline simulation fallback.

Supports both standard completion: generate(messages) -> str
and real-time streaming: generate_stream(messages) -> AsyncGenerator[str, None]
"""
import os
import json
import httpx
from typing import AsyncGenerator, List, Dict, Any

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_FAST_MODEL = os.getenv("GROQ_FAST_MODEL", "llama-3.1-8b-instant")

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "").strip()
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5")

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

TEMPERATURE = float(os.getenv("AI_TEMPERATURE", "0.7"))
MAX_TOKENS = int(os.getenv("AI_MAX_TOKENS", "750"))


def active_provider() -> str:
    if os.getenv("GROQ_API_KEY", "").strip():
        return f"groq ({GROQ_MODEL})"
    if ANTHROPIC_API_KEY:
        return f"anthropic ({ANTHROPIC_MODEL})"
    return f"ollama ({OLLAMA_MODEL})"


import socket

def is_ollama_available() -> bool:
    try:
        with socket.create_connection(("localhost", 11434), timeout=0.3):
            return True
    except OSError:
        return False

async def generate(messages: List[Dict[str, str]]) -> str:
    """Non-streaming generation with automatic fallback."""
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if groq_key:
        try:
            return await _generate_groq(messages, groq_key)
        except Exception as e:
            print(f"[Provider] Groq failed ({e}), trying next provider...")

    if ANTHROPIC_API_KEY:
        try:
            return await _generate_anthropic(messages)
        except Exception as e:
            print(f"[Provider] Anthropic failed ({e}), trying next provider...")

    if is_ollama_available():
        try:
            return await _generate_ollama(messages)
        except Exception as e:
            print(f"[Provider] Ollama call error: {e}")

    return _clinical_simulated_reply(messages)


async def generate_stream(messages: List[Dict[str, str]]) -> AsyncGenerator[str, None]:
    """Streaming token generator (SSE-ready)."""
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if groq_key:
        try:
            async for token in _stream_groq(messages, groq_key):
                yield token
            return
        except Exception as e:
            print(f"[Provider] Groq stream failed: {e}")

    # Fallback to streaming simulated tokens from standard generate
    full_text = await generate(messages)
    import asyncio
    # Stream in word or punctuation chunks
    words = full_text.split(" ")
    for i, word in enumerate(words):
        yield word + (" " if i < len(words) - 1 else "")
        await asyncio.sleep(0.015)


async def _generate_groq(messages: List[Dict[str, str]], api_key: str) -> str:
    try:
        from groq import AsyncGroq
        client = AsyncGroq(api_key=api_key)
        completion = await client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            temperature=TEMPERATURE,
            max_tokens=MAX_TOKENS,
        )
        return completion.choices[0].message.content or ""
    except Exception as e:
        # Fallback to direct HTTP request to Groq OpenAI-compatible API
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": messages,
                    "temperature": TEMPERATURE,
                    "max_tokens": MAX_TOKENS,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]


async def _stream_groq(messages: List[Dict[str, str]], api_key: str) -> AsyncGenerator[str, None]:
    from groq import AsyncGroq
    client = AsyncGroq(api_key=api_key)
    stream = await client.chat.completions.create(
        model=GROQ_MODEL,
        messages=messages,
        temperature=TEMPERATURE,
        max_tokens=MAX_TOKENS,
        stream=True,
    )
    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


async def _generate_anthropic(messages: List[Dict[str, str]]) -> str:
    system = "\n".join(m["content"] for m in messages if m["role"] == "system")
    chat = [m for m in messages if m["role"] != "system"]
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": ANTHROPIC_MODEL,
                "max_tokens": MAX_TOKENS,
                "temperature": TEMPERATURE,
                "system": system,
                "messages": chat,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return "".join(block.get("text", "") for block in data.get("content", []))


async def _generate_ollama(messages: List[Dict[str, str]]) -> str:
    # Use fast connection and read timeout so if Ollama hangs or is not running, fallback engages promptly
    fast_timeout = httpx.Timeout(3.0, connect=1.0)
    async with httpx.AsyncClient(timeout=fast_timeout) as client:
        resp = await client.post(
            f"{OLLAMA_HOST}/api/chat",
            json={
                "model": OLLAMA_MODEL,
                "messages": messages,
                "stream": False,
                "options": {"temperature": TEMPERATURE, "num_predict": MAX_TOKENS},
            },
        )
        resp.raise_for_status()
        return resp.json()["message"]["content"]


def _clinical_simulated_reply(messages: List[Dict[str, str]]) -> str:
    user_msg = messages[-1]["content"].lower() if messages else ""

    if "tripm" in user_msg or "psychopath" in user_msg or "boldness" in user_msg:
        return (
            "Thank you for sharing these assessment findings with me. Looking at the **Triarchic Psychopathy (TriPM)** model, "
            "it is helpful to deconstruct these traits into distinct phenotypic dimensions:\n\n"
            "• **Boldness** reflects autonomic resilience, social poise, and low fear sensitivity. In constructive contexts, it fuels decisive leadership and calm under pressure.\n"
            "• **Meanness** represents callous emotional detachment and reduced empathy. When elevated, it often serves as a defensive armor against emotional vulnerability.\n"
            "• **Disinhibition** indicates deficits in executive impulse control and low boredom tolerance.\n\n"
            "How do these scores align with your everyday relationships? Do you notice these dynamics manifesting more during conflict or high-pressure situations?"
        )

    if "lsrp" in user_msg or "sociopath" in user_msg or "dark triad" in user_msg:
        return (
            "Examining these results through a psychometric lens offers valuable psychoeducation. "
            "Forensic psychology distinguishes between calculating, low-anxiety traits (**Primary Factor**) "
            "and reactive, emotionally turbulent traits (**Secondary Factor**), which often trace back to early developmental hyper-vigilance.\n\n"
            "Understanding these patterns helps us observe our automatic behavioral schemas rather than being ruled by them. "
            "What specific question or life situation prompted you to explore this screener today?"
        )

    if "anxious" in user_msg or "worry" in user_msg or "panic" in user_msg:
        return (
            "I hear how demanding and exhausting this anxiety is feeling right now. "
            "When our nervous system senses perceived threat, it instinctively shifts into fight-or-flight arousal.\n\n"
            "Let's ground your physiological baseline together:\n"
            "1. **Drop your shoulders** and unclench your jaw.\n"
            "2. Take a slow inhale for 4 seconds, and a prolonged exhale for 7 seconds to stimulate the vagal brake.\n\n"
            "What is the single most urgent thought demanding your attention right now? Let's untangle it together."
        )

    return (
        "I am listening closely, and I appreciate you sharing this with me. "
        "Every thought, pattern, and emotional state carries valuable information about what your mind and nervous system are navigating.\n\n"
        "As we look at this together, what feels like the most helpful direction for us right now: "
        "exploring the root feelings underneath, or identifying an evidence-based cognitive technique (like a CBT thought record or DBT grounding skill) to bring clarity?"
    )
