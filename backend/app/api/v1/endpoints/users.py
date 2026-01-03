from typing import List, Any
from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.api import deps
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[User])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(deps.get_db),
):
    result = await db.execute(select(User).offset(skip).limit(limit))
    return result.scalars().all()

@router.post("/", response_model=User)
async def create_user(
    user_in: User,
    db: AsyncSession = Depends(deps.get_db),
):
    # In real app, check email uniqueness and hash password
    # user_in.hashed_password = get_password_hash(user_in.password)
    db.add(user_in)
    await db.commit()
    await db.refresh(user_in)
    return user_in

@router.get("/me", response_model=User)
def read_user_me(
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get current user.
    """
    return current_user
