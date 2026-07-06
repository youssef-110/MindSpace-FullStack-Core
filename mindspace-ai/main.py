"""MindSpace Companion backend — FastAPI.

Run:  python main.py   (serves on http://localhost:8000)
"""
import os
from pathlib import Path
from typing import Any, Dict, List

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load the project-root .env (one directory up) and a local one if present.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")
load_dotenv()

import providers  # noqa: E402  (needs env loaded first)
from prompts import build_messages  # noqa: E402
from safety import CRISIS_PREFIX, detect_crisis  # noqa: E402

app = FastAPI(title="MindSpace Companion API", version="2.0")

allowed = os.getenv("CORS_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in allowed.split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)

# The RAG "brain" loads embedding models — import lazily so the API still
# starts fast (and still works) even if vector deps are missing.
_brain = None
_brain_error = None


def get_brain():
    global _brain, _brain_error
    if _brain is None and _brain_error is None:
        try:
            from brain import brain
            _brain = brain
        except Exception as e:  # missing deps, model download failure, etc.
            _brain_error = str(e)
    return _brain


class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
    mood_context: List[Dict[str, Any]] = []


FALLBACK_ANSWER = (
    "I'm having trouble reaching my language model right now. "
    "If you're using the local model, make sure **Ollama** is running (`ollama serve`) "
    "and that you've pulled a model (`ollama pull llama3`). "
    "Or add an `ANTHROPIC_API_KEY` to the .env file to use Claude instead.\n\n"
    "While I reboot my brain: the Breathe and Journal pages work offline, "
    "and the Resources page has 24/7 human support lines if you need someone now."
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "provider": providers.active_provider(),
        "rag": _brain is not None,
    }


@app.post("/chat")
async def chat(request: ChatRequest):
    crisis = detect_crisis(request.message)

    context = ""
    b = get_brain()
    if b is not None:
        try:
            context = b.get_relevant_context(request.message)
        except Exception as e:
            print(f"RAG lookup failed: {e}")

    messages = build_messages(
        request.message,
        request.history,
        context=context,
        mood_context=request.mood_context,
    )

    try:
        answer = await providers.generate(messages)
    except Exception as e:
        print(f"Generation error: {e}")
        answer = FALLBACK_ANSWER

    # Belt-and-braces: make sure crisis resources always appear when needed.
    if crisis and "988" not in answer:
        answer = CRISIS_PREFIX + answer

    return {"answer": answer, "crisis": crisis}


@app.post("/sync")
async def sync_data():
    """Re-index the /data psychology files into the vector store."""
    b = get_brain()
    if b is None:
        return {"status": "error", "message": f"RAG brain unavailable: {_brain_error}"}
    try:
        return {"status": "success", "message": b.process_new_logs()}
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
