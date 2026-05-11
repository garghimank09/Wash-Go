from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user
from app.auth.jwt_handler import create_access_token
from app.auth.password_handler import verify_password
from app.database.database import get_db
from app.models.user import User
from app.schemas.auth_schema import Token
from app.schemas.user_schema import UserCreate, UserLogin, UserRead
from app.services import user_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserCreate, db: Annotated[AsyncSession, Depends(get_db)]) -> User:
    return await user_service.create_user(db, payload)


@router.post("/login", response_model=Token)
async def login(payload: UserLogin, db: Annotated[AsyncSession, Depends(get_db)]) -> Token:
    user = await user_service.get_user_by_email(db, str(payload.email).lower())
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")

    access_token = create_access_token(user.id, user.role)
    return Token(access_token=access_token)


@router.get("/me", response_model=UserRead)
async def read_me(current: Annotated[User, Depends(get_current_active_user)]) -> User:
    return current
