"""
Database configuration and session management
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

async def init_db():
    """Initialize database tables and ensure default guest user exists"""
    Base.metadata.create_all(bind=engine)

    # Auth is disabled — ensure a default guest user (id=1) always exists
    db = SessionLocal()
    try:
        from app.models.database_models import User
        from app.core.security import get_password_hash
        if not db.query(User).filter(User.id == 1).first():
            guest = User(
                id=1,
                email="guest@lawmind.local",
                hashed_password=get_password_hash("guest"),
                full_name="Guest Advocate",
                organization="LawMind",
                role="advocate",
                is_active=True,
            )
            db.add(guest)
            db.commit()
            print("[+] Default guest user created (auth disabled)")
    finally:
        db.close()

def get_db():
    """Dependency for database sessions"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
