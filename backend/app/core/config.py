"""
Configuration settings for LawMind Backend
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from pathlib import Path


class Settings(BaseSettings):
    """Application settings"""
    
    # App Settings
    APP_NAME: str = "LawMind"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str = "sqlite:///./lawmind.db"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "https://velarixx-lawmind-backend.hf.space",
        "https://*.hf.space",
    ]
    
    # AI/LLM Settings (Gemini — free at aistudio.google.com)
    GEMINI_API_KEY: str = ""

    # LLM Model Configuration
    LLM_MODEL: str = "gemini-1.5-flash"
    LLM_TEMPERATURE: float = 0.3
    LLM_MAX_TOKENS: int = 2000
    
    # Vector Database
    VECTOR_DB_PATH: str = "./data/vectordb"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".docx", ".txt"]
    
    # Voice Processing
    WHISPER_MODEL: str = "base"
    AUDIO_MAX_SIZE: int = 25 * 1024 * 1024  # 25MB
    
    # Document Processing
    EXPORT_DIR: str = "./exports"
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()

# Create necessary directories
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.EXPORT_DIR).mkdir(parents=True, exist_ok=True)
Path(settings.VECTOR_DB_PATH).mkdir(parents=True, exist_ok=True)
