"""
Authentication router — auth DISABLED, open access mode
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_token, GUEST_USER_ID
from app.models.schemas import UserResponse
from app.models.database_models import User

router = APIRouter()


def get_current_user(
    token_data: dict = Depends(verify_token),
    db: Session = Depends(get_db),
) -> User:
    """Always returns the default guest user (auth disabled)"""
    user = db.query(User).filter(User.id == GUEST_USER_ID).first()
    if not user:
        raise HTTPException(status_code=500, detail="Default user not found — run server to init DB")
    return user


@router.get("/me", response_model=UserResponse)
async def me(db: Session = Depends(get_db)):
    """Return guest user profile"""
    user = db.query(User).filter(User.id == GUEST_USER_ID).first()
    if not user:
        raise HTTPException(status_code=500, detail="Default user not found")
    return user


@router.post("/login")
async def login():
    """Auth disabled — always succeeds"""
    return {"access_token": "disabled", "token_type": "bearer", "message": "Auth disabled"}


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(db: Session = Depends(get_db)):
    """Auth disabled — returns guest user"""
    user = db.query(User).filter(User.id == GUEST_USER_ID).first()
    return user
