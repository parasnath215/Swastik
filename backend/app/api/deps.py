from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session
from app.core import config, db
from app.models.user import User

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{config.settings.API_V1_STR}/login/access-token"
)

async def get_db() -> Generator:
    async with db.async_session() as session:
        yield session

# Placeholder for get_current_user, needing implementation
def get_current_user():
    pass
