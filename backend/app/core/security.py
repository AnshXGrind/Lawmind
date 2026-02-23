"""
Security utilities — authentication DISABLED (open access mode)
"""

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Default guest user id used everywhere
GUEST_USER_ID = 1

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def verify_token() -> dict:
    """Auth disabled — always return the default guest user payload"""
    return {"sub": str(GUEST_USER_ID), "email": "guest@lawmind.local"}
