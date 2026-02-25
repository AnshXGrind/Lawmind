"""LawMind Configuration — Replit Compatible"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from pathlib import Path
import os, json


class Settings(BaseSettings):
    APP_NAME: str = "LawMind"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8080

    SECRET_KEY: str = "lawmind-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    DATABASE_URL: str = "sqlite:///./lawmind.db"

    GEMINI_API_KEY: str = ""
    LLM_MODEL: str = "gemini-1.5-flash"
    LLM_TEMPERATURE: float = 0.2
    LLM_MAX_TOKENS: int = 4096

    UPLOAD_DIR: str = "./uploads"
    EXPORT_DIR: str = "./exports"
    VECTOR_DB_PATH: str = "./data/vectordb"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".docx", ".txt"]
    EMBEDDING_MODEL: str = "disabled"

    @property
    def CORS_ORIGINS(self) -> List[str]:
        base = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
        ]
        # Add explicit frontend URL if provided
        frontend_url = os.getenv("FRONTEND_URL", "").rstrip("/")
        if frontend_url:
            base.append(frontend_url)
        # Parse CORS_ORIGINS env var (JSON array or single URL)
        raw = os.getenv("CORS_ORIGINS", "")
        if raw:
            try:
                parsed = json.loads(raw)
                if isinstance(parsed, list):
                    return list(dict.fromkeys(base + parsed))  # deduplicate
            except Exception:
                return list(dict.fromkeys(base + [raw.strip()]))
        return base

    @property
    def CORS_REGEX(self) -> str:
        """Regex pattern matching Vercel and Hugging Face preview URLs"""
        return r"https://(.*\.vercel\.app|.*\.hf\.space|.*\.huggingface\.co)"

    model_config = SettingsConfigDict(
        env_file=".env", case_sensitive=True, extra="ignore"
    )


settings = Settings()

for d in [settings.UPLOAD_DIR, settings.EXPORT_DIR, settings.VECTOR_DB_PATH]:
    Path(d).mkdir(parents=True, exist_ok=True)