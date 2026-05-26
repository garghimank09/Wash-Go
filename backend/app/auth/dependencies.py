from collections.abc import Callable
from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt_handler import decode_access_token
from app.config.settings import settings
from app.database.database import get_db
from app.models.user import User, UserRole


def admin_console_demo_allowed() -> bool:
    return settings.ENVIRONMENT != "production" and settings.ADMIN_UI_DEMO_ALLOW


def user_has_admin_console_access(user: User) -> bool:
    return user.role == UserRole.admin or admin_console_demo_allowed()

security = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> User:
    token: str | None = None
    if credentials is not None and credentials.scheme.lower() == "bearer":
        token = credentials.credentials
    if not token:
        from app.auth.auth_cookies import token_from_cookies

        token = token_from_cookies(request.cookies)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = decode_access_token(token)
        if payload.get("type") != "access":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user_id = UUID(str(payload.get("sub")))
    except JWTError as exc:
        detail = "Token expired — please sign in again" if "expired" in str(exc).lower() else "Could not validate credentials"
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return current_user


def require_roles(*allowed: UserRole) -> Callable[..., User]:
    async def _dependency(user: Annotated[User, Depends(get_current_active_user)]) -> User:
        if user.role not in allowed and user.role != UserRole.admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return user

    return _dependency


def require_admin_console() -> Callable[..., User]:
    """Admin role, or any authenticated user when ADMIN_UI_DEMO_ALLOW (dev/preview)."""

    async def _dependency(user: Annotated[User, Depends(get_current_active_user)]) -> User:
        if not user_has_admin_console_access(user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin console access required",
            )
        return user

    return _dependency
