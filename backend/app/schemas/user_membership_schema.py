from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class MembershipSubscribeRequest(BaseModel):
    plan_slug: str = Field(min_length=2, max_length=64)


class UserMembershipRead(BaseModel):
    id: UUID
    plan_slug: str
    plan_name: str
    status: str
    washes_remaining: int
    washes_included: int
    price_cents: int
    currency: str
    features: list[str]
    starts_at: datetime
    ends_at: datetime
    is_popular: bool = False

    model_config = {"from_attributes": True}


class UserMembershipReadOptional(BaseModel):
    membership: UserMembershipRead | None = None
