from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=2000)


class ReviewRead(BaseModel):
    id: UUID
    booking_id: UUID
    rating: int
    comment: str | None
    created_at: datetime
    reviewer_name: str | None = None
    reviewee_name: str | None = None

    model_config = {"from_attributes": True}


class ReviewAdminRead(ReviewRead):
    """Admin list row with booking context."""

    service_address: str | None = None
    booking_status: str | None = None


class ReviewAdminList(BaseModel):
    items: list[ReviewAdminRead]


class ReviewPartnerRead(ReviewRead):
    """Partner list row — feedback received on a completed job."""

    service_address: str | None = None


class ReviewPartnerList(BaseModel):
    items: list[ReviewPartnerRead]
