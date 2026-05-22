import re
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.user import UserRole


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=200)
    phone: str = Field(min_length=10, max_length=10)
    otp_code: str | None = Field(default=None, min_length=6, max_length=6)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("Password must contain at least one letter and one number")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        normalized = _normalize_indian_phone(v)
        if normalized is None:
            raise ValueError("Phone must be a valid 10-digit Indian mobile number")
        return normalized


def _normalize_indian_phone(value: str | None) -> str | None:
    if value is None:
        return None
    trimmed = value.strip()
    if not trimmed:
        return None
    digits = re.sub(r"\D", "", trimmed)
    if digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    if len(digits) != 10 or not re.fullmatch(r"[6-9]\d{9}", digits):
        raise ValueError("Phone must be a valid 10-digit Indian mobile number")
    return digits


class PartnerSignup(BaseModel):
    """Register a field partner (washer) + empty washer profile — same password rules as customers."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=200)
    phone: str = Field(min_length=10, max_length=10)
    service_area: str = Field(min_length=3, max_length=255)
    otp_code: str | None = Field(default=None, min_length=6, max_length=6)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("Password must contain at least one letter and one number")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        normalized = _normalize_indian_phone(v)
        if normalized is None:
            raise ValueError("Phone must be a valid 10-digit Indian mobile number")
        return normalized

    @field_validator("service_area")
    @classmethod
    def validate_service_area(cls, v: str) -> str:
        trimmed = v.strip()
        if len(trimmed) < 3:
            raise ValueError("Service area is required")
        return trimmed


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)
    otp_code: str | None = Field(default=None, min_length=6, max_length=6)


class PasswordResetRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
            raise ValueError("Password must contain at least one letter and one number")
        return v


class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    phone: str | None
    role: UserRole
    is_active: bool
    is_verified: bool

    model_config = {"from_attributes": True}
