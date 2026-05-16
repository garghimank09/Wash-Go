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
