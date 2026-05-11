from uuid import UUID

from pydantic import BaseModel

from app.models.user import UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: UUID
    role: UserRole
    exp: int | None = None
