from uuid import UUID

from pydantic import BaseModel, Field


class WasherAvailabilityRead(BaseModel):
    washer_id: UUID
    full_name: str
    service_area: str | None = None
    is_available: bool
    rating_avg: float = 0.0


class WasherAvailabilityUpdate(BaseModel):
    """When false, washer is hidden from admin dispatch suggestions."""

    is_available: bool = Field(description="True when online and accepting dispatch offers")


class PartnerProfileRead(BaseModel):
    id: UUID
    email: str
    full_name: str
    phone: str | None = None
    avatar_url: str | None = None
    service_area: str | None = None
    bio: str | None = None
    washer_id: UUID


class PartnerProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=200)
    phone: str | None = Field(default=None, max_length=32)
    service_area: str | None = Field(default=None, max_length=255)
    bio: str | None = Field(default=None, max_length=2000)
