from enum import Enum

from pydantic import BaseModel, EmailStr, Field


class OtpPurposeEnum(str, Enum):
    signup = "signup"
    login = "login"
    password_reset = "password_reset"


class OtpSendRequest(BaseModel):
    email: EmailStr
    purpose: OtpPurposeEnum
    role_hint: str | None = Field(
        default=None,
        description="Optional: customer | partner | admin — used in email branding",
    )


class OtpSendResponse(BaseModel):
    sent: bool
    demo_skip: bool = False
    message: str
    expires_in_seconds: int = 0
