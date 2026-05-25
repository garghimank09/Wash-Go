from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import UUID

from jose import JWTError, jwt

from app.config.settings import settings
from app.models.user import UserRole


def create_access_token(subject: UUID, role: UserRole, extra_claims: dict[str, Any] | None = None) -> str:
    token, _ = issue_access_token(subject, role, extra_claims=extra_claims)
    return token


def issue_access_token(
    subject: UUID,
    role: UserRole,
    extra_claims: dict[str, Any] | None = None,
) -> tuple[str, datetime]:
    """Return (jwt, expiry UTC) for login responses."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode: dict[str, Any] = {
        "sub": str(subject),
        "role": role.value,
        "exp": expire,
        "iat": now,
        "type": "access",
    }
    if extra_claims:
        to_encode.update(extra_claims)
    token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token, expire


def build_token_response(subject: UUID, role: UserRole) -> dict[str, Any]:
    """Payload for Token schema: access_token, expires_in (seconds), expires_at."""
    token, expire = issue_access_token(subject, role)
    now = datetime.now(timezone.utc)
    expires_in = max(1, int((expire - now).total_seconds()))
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": expires_in,
        "expires_at": expire,
    }


def decode_access_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


def safe_decode_access_token(token: str) -> dict[str, Any] | None:
    try:
        return decode_access_token(token)
    except JWTError:
        return None
