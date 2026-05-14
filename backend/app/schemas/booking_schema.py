from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, model_validator

from app.models.booking import BookingStatus


class BookingCreate(BaseModel):
    car_id: UUID
    washer_id: UUID | None = None
    scheduled_at: datetime
    service_address: str = Field(min_length=5, max_length=500)
    latitude: Decimal | None = Field(default=None, ge=-90, le=90)
    longitude: Decimal | None = Field(default=None, ge=-180, le=180)
    price_cents: int = Field(ge=0, le=10_000_000)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    notes: str | None = Field(default=None, max_length=2000)

    @field_validator("currency")
    @classmethod
    def upper_currency(cls, v: str) -> str:
        return v.upper()

    @model_validator(mode="after")
    def scheduled_in_future(self) -> "BookingCreate":
        if self.scheduled_at <= datetime.now(UTC):
            raise ValueError("scheduled_at must be in the future")
        return self


class BookingRead(BaseModel):
    id: UUID
    customer_id: UUID
    car_id: UUID
    washer_id: UUID | None
    status: BookingStatus
    scheduled_at: datetime
    service_address: str
    latitude: Decimal | None
    longitude: Decimal | None
    price_cents: int
    currency: str
    notes: str | None

    model_config = {"from_attributes": True}


class BookingReadList(BaseModel):
    items: list[BookingRead]


CANCEL_REASON_KEYS = frozenset(
    {
        "change_of_plans",
        "wrong_time",
        "emergency",
        "price_issue",
        "vehicle_unavailable",
        "other",
    }
)


class BookingCancelBody(BaseModel):
    reason_key: str = Field(min_length=3, max_length=64)
    reason_detail: str | None = Field(default=None, max_length=500)

    @field_validator("reason_key")
    @classmethod
    def known_reason(cls, v: str) -> str:
        if v not in CANCEL_REASON_KEYS:
            raise ValueError("invalid cancellation reason")
        return v


class BookingRescheduleBody(BaseModel):
    scheduled_at: datetime

    @model_validator(mode="after")
    def scheduled_in_future(self) -> "BookingRescheduleBody":
        if self.scheduled_at <= datetime.now(UTC):
            raise ValueError("scheduled_at must be in the future")
        return self


class WasherPublic(BaseModel):
    id: UUID
    full_name: str
    rating_avg: float
    service_area: str | None = None

    model_config = {"from_attributes": True}


class BookingTimelineStep(BaseModel):
    key: str
    label: str
    done: bool
    at: datetime | None = None


class BookingDetailRead(BaseModel):
    id: UUID
    customer_id: UUID
    car_id: UUID
    washer_id: UUID | None
    status: BookingStatus
    scheduled_at: datetime
    service_address: str
    latitude: Decimal | None
    longitude: Decimal | None
    price_cents: int
    currency: str
    notes: str | None
    created_at: datetime
    car_label: str | None = None
    washer: WasherPublic | None = None
    eta_minutes: int | None = None
    timeline: list[BookingTimelineStep]

    model_config = {"from_attributes": True}
