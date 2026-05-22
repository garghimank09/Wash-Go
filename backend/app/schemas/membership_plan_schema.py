import re
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

SLUG_PATTERN = re.compile(r"^[a-z][a-z0-9_]*$")


class MembershipPlanRead(BaseModel):
    slug: str
    name: str
    description: str | None = None
    price_cents: int
    currency: str
    features: list[str]
    washes_included: int
    sort_order: int
    is_popular: bool

    model_config = {"from_attributes": True}


class MembershipPlanReadList(BaseModel):
    items: list[MembershipPlanRead]


class MembershipPlanAdminRead(MembershipPlanRead):
    id: UUID
    duration_days: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MembershipPlanAdminReadList(BaseModel):
    items: list[MembershipPlanAdminRead]


class MembershipPlanCreate(BaseModel):
    slug: str = Field(min_length=2, max_length=64)
    name: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=2000)
    price_cents: int = Field(gt=0, le=100_000_000)
    currency: str = Field(default="INR", max_length=3)
    duration_days: int = Field(default=30, ge=1, le=365)
    features: list[str] = Field(min_length=1)
    washes_included: int = Field(default=1, ge=1, le=999)
    sort_order: int = Field(default=0, ge=0, le=9999)
    is_popular: bool = False
    is_active: bool = True

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: str) -> str:
        s = v.strip().lower()
        if not SLUG_PATTERN.match(s):
            raise ValueError("slug must be lowercase letters, numbers, and underscores")
        return s

    @field_validator("features")
    @classmethod
    def validate_features(cls, v: list[str]) -> list[str]:
        cleaned = [f.strip() for f in v if f and f.strip()]
        if not cleaned:
            raise ValueError("Add at least one feature")
        return cleaned

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        return v.strip().upper() or "INR"


class MembershipPlanUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=2000)
    price_cents: int | None = Field(default=None, gt=0, le=100_000_000)
    currency: str | None = Field(default=None, max_length=3)
    duration_days: int | None = Field(default=None, ge=1, le=365)
    features: list[str] | None = None
    washes_included: int | None = Field(default=None, ge=1, le=999)
    sort_order: int | None = Field(default=None, ge=0, le=9999)
    is_popular: bool | None = None
    is_active: bool | None = None

    @field_validator("features")
    @classmethod
    def validate_features(cls, v: list[str] | None) -> list[str] | None:
        if v is None:
            return None
        cleaned = [f.strip() for f in v if f and f.strip()]
        if not cleaned:
            raise ValueError("Add at least one feature")
        return cleaned
