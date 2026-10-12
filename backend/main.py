import sys
from pathlib import Path

# Add mindspace-ai to path
mindspace_dir = Path(__file__).resolve().parent.parent / "mindspace-ai"
sys.path.insert(0, str(mindspace_dir))

from main import app  # noqa: F401

if __name__ == "__main__":
    import uvicorn
    import os
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
