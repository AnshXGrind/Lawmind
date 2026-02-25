"""LawMind Backend — Production (Replit)"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn, os, importlib, logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from app.core.config import settings
from app.core.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("[*] LawMind starting...")
    await init_db()
    logger.info("[+] Ready!")
    yield


app = FastAPI(
    title="LawMind API",
    description="AI-Powered Indian Legal Drafting Assistant",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — accepts all Vercel URLs automatically
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load routers — skip any that fail (optional features)
_routers = [
    ("app.routers.auth",      "/api/auth",      "Auth"),
    ("app.routers.drafts",    "/api/drafts",    "Drafts"),
    ("app.routers.documents", "/api/documents", "Documents"),
    ("app.routers.citations", "/api/citations", "Citations"),
    ("app.routers.dataset",   "/api/dataset",   "Dataset"),
    ("app.routers.analytics", "/api/analytics", "Analytics"),
]
for mod_path, prefix, tag in _routers:
    try:
        mod = importlib.import_module(mod_path)
        app.include_router(mod.router, prefix=prefix, tags=[tag])
        logger.info(f"[+] Router loaded: {prefix}")
    except Exception as e:
        logger.warning(f"[!] Skipped {mod_path}: {e}")


@app.get("/")
async def root():
    return {"status": "active", "service": "LawMind API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "LawMind"}


@app.get("/ping")
async def ping():
    """Lightweight keepalive for UptimeRobot"""
    return "pong"


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
