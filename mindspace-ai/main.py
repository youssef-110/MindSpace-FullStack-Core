"""MindSpace Clinical Platform Backend — FastAPI with Groq & RAG.

Serves on: http://localhost:8000
Endpoints:
  - POST /chat
  - POST /chat/stream (SSE)
  - POST /api/chat/stream (SSE)
  - GET  /health
  - POST /sync
"""
import os
import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

# Load project-root .env (one directory up) and local if present
load_dotenv(Path(__file__).resolve().parent.parent / ".env")
load_dotenv()

import providers
from prompts import build_messages
from safety import CRISIS_PREFIX, detect_crisis

app = FastAPI(title="MindSpace Clinical & Groq AI API", version="3.0")

allowed = os.getenv("CORS_ORIGINS", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in allowed.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_brain = None
_brain_error = None


def get_brain():
    global _brain, _brain_error
    if _brain is None and _brain_error is None:
        try:
            from brain import brain
            _brain = brain
        except Exception as e:
            _brain_error = str(e)
            print(f"[Brain] Could not initialize RAG brain: {e}")
    return _brain


class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
    mood_context: List[Dict[str, Any]] = []
    test_context: Optional[Dict[str, Any]] = None
    journal_context: List[Dict[str, Any]] = []


FALLBACK_ANSWER = (
    "I am currently operating in resilient offline psychoeducation mode. "
    "To enable high-speed clinical synthesis, add a `GROQ_API_KEY` to your root `.env` file.\n\n"
    "Meanwhile, all psychological screeners, journaling exercises, and breathing tools remain fully active in your browser. "
    "If you are facing an urgent crisis, confidential support is available 24/7 by calling or texting **988**."
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "platform": "MindSpace Clinical AI",
        "provider": providers.active_provider(),
        "rag": get_brain() is not None,
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
            print(f"[RAG] Lookup failed: {e}")

    messages = build_messages(
        request.message,
        request.history,
        context=context,
        mood_context=request.mood_context,
        test_context=request.test_context,
        journal_context=request.journal_context,
    )

    try:
        answer = await providers.generate(messages)
    except Exception as e:
        print(f"[Chat] Generation error: {e}")
        answer = FALLBACK_ANSWER

    if crisis and "988" not in answer:
        answer = CRISIS_PREFIX + answer

    return {"answer": answer, "crisis": crisis}


@app.post("/api/chat/stream")
@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    crisis = detect_crisis(request.message)

    context = ""
    b = get_brain()
    if b is not None:
        try:
            context = b.get_relevant_context(request.message)
        except Exception as e:
            print(f"[RAG] Stream lookup failed: {e}")

    messages = build_messages(
        request.message,
        request.history,
        context=context,
        mood_context=request.mood_context,
        test_context=request.test_context,
        journal_context=request.journal_context,
    )

    async def event_generator():
        # If crisis was detected on input, immediately stream crisis warning header
        if crisis:
            yield f"data: {json.dumps({'token': CRISIS_PREFIX})}\n\n"

        try:
            async for token in providers.generate_stream(messages):
                yield f"data: {json.dumps({'token': token})}\n\n"
        except Exception as e:
            print(f"[Stream] Provider stream failed: {e}")
            yield f"data: {json.dumps({'token': FALLBACK_ANSWER})}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/sync")
async def sync_data():
    """Re-index the psychology and DSM knowledge files into the vector database."""
    b = get_brain()
    if b is None:
        return {"status": "error", "message": f"RAG brain unavailable: {_brain_error}"}
    try:
        result = b.process_new_logs()
        return {"status": "success", "message": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
