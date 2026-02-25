"""Database configuration — SQLite optimised for Replit"""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False,
)

if "sqlite" in settings.DATABASE_URL:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, _):
        cur = dbapi_conn.cursor()
        cur.execute("PRAGMA journal_mode=WAL")
        cur.execute("PRAGMA synchronous=NORMAL")
        cur.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


async def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        from app.models.database_models import User
        from app.core.security import get_password_hash
        if not db.query(User).filter(User.id == 1).first():
            db.add(User(
                id=1,
                email="guest@lawmind.local",
                hashed_password=get_password_hash("guest123"),
                full_name="Guest Advocate",
                organization="LawMind",
                role="advocate",
                is_active=True,
            ))
            db.commit()
            logger.info("[+] Guest user created")
    except Exception as e:
        logger.warning(f"[!] DB init warning: {e}")
        db.rollback()
    finally:
        db.close()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()