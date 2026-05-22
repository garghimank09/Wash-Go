import re
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

SLUG_PATTERN = re.compile(r"^[a-z][a-z0-9_]*$")
ALLOWED_ICONS = frozenset({"droplets", "sparkles", "star", "crown"})
ALLOWED_BADGES = frozenset({"Popular", "Best value"})


class WashTierRead(BaseModel):
    slug: str
    name: str
    description: str | None = None
    price_cents: int
    features: list[str]
    badge: str | None = None
    icon: str
    sort_order: int

    model_config = {"from_attributes": True}


class WashTierReadList(BaseModel):
    items: list[WashTierRead]


class WashTierAdminRead(WashTierRead):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class WashTierAdminReadList(BaseModel):
    items: list[WashTierAdminRead]


class WashTierCreate(BaseModel):
    slug: str = Field(min_length=2, max_length=64)
    name: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=2000)
    price_cents: int = Field(gt=0, le=10_000_000)
    features: list[str] = Field(min_length=1)
    badge: str | None = Field(default=None, max_length=32)
    icon: str = Field(default="sparkles", max_length=32)
    sort_order: int = Field(default=0, ge=0, le=9999)
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
            raise ValueError("At least one feature is required")
        return cleaned

    @field_validator("icon")
    @classmethod
    def validate_icon(cls, v: str) -> str:
        if v not in ALLOWED_ICONS:
            raise ValueError(f"icon must be one of: {', '.join(sorted(ALLOWED_ICONS))}")
        return v

    @field_validator("badge")
    @classmethod
    def validate_badge(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        if v not in ALLOWED_BADGES:
            raise ValueError(f"badge must be one of: {', '.join(sorted(ALLOWED_BADGES))}")
        return v


class WashTierUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=2000)
    price_cents: int | None = Field(default=None, gt=0, le=10_000_000)
    features: list[str] | None = None
    badge: str | None = None
    icon: str | None = Field(default=None, max_length=32)
    sort_order: int | None = Field(default=None, ge=0, le=9999)
    is_active: bool | None = None

    @field_validator("features")
    @classmethod
    def validate_features(cls, v: list[str] | None) -> list[str] | None:
        if v is None:
            return None
        cleaned = [f.strip() for f in v if f and f.strip()]
        if not cleaned:
            raise ValueError("At least one feature is required")
        return cleaned

    @field_validator("icon")
    @classmethod
    def validate_icon(cls, v: str | None) -> str | None:
        if v is None:
            return None
        if v not in ALLOWED_ICONS:
            raise ValueError(f"icon must be one of: {', '.join(sorted(ALLOWED_ICONS))}")
        return v

    @field_validator("badge")
    @classmethod
    def validate_badge(cls, v: str | None) -> str | None:
        if v is None:
            return None
        if v == "":
            return None
        if v not in ALLOWED_BADGES:
            raise ValueError(f"badge must be one of: {', '.join(sorted(ALLOWED_BADGES))}")
        return v
