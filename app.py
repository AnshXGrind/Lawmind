"""
Hugging Face Spaces entry point.
HF Spaces looks for app.py — this file makes the FastAPI app discoverable.
"""
import uvicorn

# Import the FastAPI app from the backend
from main import app  # noqa: F401 — re-exported for HF detection

if __name__ == "__main__":
    import os
    port = int(os.getenv("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
