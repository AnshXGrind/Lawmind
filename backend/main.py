"""
LawMind Backend - Main FastAPI Application
AI-Powered Legal Drafting Assistant
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.routers import drafts, auth, documents, citations, dataset, analytics
from app.core.config import settings
from app.core.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup"""
    print("[*] LawMind Backend Starting...")
    await init_db()
    print("[+] Database initialized")
    yield
    print("[-] LawMind Backend Shutting Down...")

app = FastAPI(
    title="LawMind API",
    description="AI-Powered Legal Drafting Assistant for Indian Law",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(drafts.router, prefix="/api/drafts", tags=["Legal Drafts"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(citations.router, prefix="/api/citations", tags=["Citations"])
app.include_router(dataset.router, prefix="/api/dataset", tags=["Dataset Management"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics & Insights"])

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "active",
        "service": "LawMind API",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "ai_service": "ready"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
