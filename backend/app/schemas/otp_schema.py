from enum import Enum

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

from app.schemas.user_schema import _normalize_indian_phone


class OtpPurposeEnum(str, Enum):
    signup = "signup"
    login = "login"
    password_reset = "password_reset"


class OtpSendRequest(BaseModel):
    """Send OTP via SMS (Twilio). Signup requires email + phone; login/reset use phone only."""

    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=32)
    purpose: OtpPurposeEnum
    role_hint: str | None = Field(
        default=None,
        description="Optional: customer | partner | admin",
    )

    @field_validator("email", mode="before")
    @classmethod
    def empty_email_to_none(cls, v):
        if v is None or (isinstance(v, str) and not v.strip()):
            return None
        return v

    @field_validator("phone", mode="before")
    @classmethod
    def empty_phone_to_none(cls, v):
        if v is None or (isinstance(v, str) and not v.strip()):
            return None
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str | None) -> str | None:
        if v is None:
            return None
        return _normalize_indian_phone(v)

    @model_validator(mode="after")
    def require_fields(self) -> "OtpSendRequest":
        if self.purpose == OtpPurposeEnum.signup:
            if not self.email:
                raise ValueError("Email is required for signup")
            if not self.phone:
                raise ValueError("Phone number is required for signup")
        elif not self.phone:
            raise ValueError("Phone number is required")
        return self


class OtpSendResponse(BaseModel):
    sent: bool
    demo_skip: bool = False
    message: str
    expires_in_seconds: int = 0
    delivery_target: str | None = None
    account_email: str | None = None
