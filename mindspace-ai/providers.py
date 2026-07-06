"""LLM provider layer.

Priority:
  1. Anthropic Claude, if ANTHROPIC_API_KEY is set in .env (best quality)
  2. Local Ollama (default: llama3) — free, private, offline

Both are called through one function: generate(messages) -> str
"""
import os

import httpx

OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "").strip()
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5")
TEMPERATURE = float(os.getenv("AI_TEMPERATURE", "0.7"))
MAX_TOKENS = int(os.getenv("AI_MAX_TOKENS", "600"))


def active_provider() -> str:
    return "anthropic" if ANTHROPIC_API_KEY else "ollama"


async def generate(messages: list) -> str:
    """messages: OpenAI-style [{role, content}] including a 'system' message."""
    if ANTHROPIC_API_KEY:
        return await _generate_anthropic(messages)
    return await _generate_ollama(messages)


async def _generate_anthropic(messages: list) -> str:
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


async def _generate_ollama(messages: list) -> str:
    async with httpx.AsyncClient(timeout=120) as client:
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
