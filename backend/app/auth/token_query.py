"""Authenticate SSE clients via `?token=` (EventSource cannot send Authorization headers)."""

from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, Query, status
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt_handler import decode_access_token
from app.database.database import get_db
from app.models.user import User


async def get_current_user_from_query_token(
    db: Annotated[AsyncSession, Depends(get_db)],
    token: Annotated[str, Query(min_length=10, description="JWT access token")],
) -> User:
    try:
        payload = decode_access_token(token)
        if payload.get("type") != "access":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user_id = UUID(str(payload.get("sub")))
    except (JWTError, ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return user
