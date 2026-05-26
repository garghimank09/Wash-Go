from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, model_validator

from app.models.booking import BookingStatus, HandoffStatus


class BookingCreate(BaseModel):
    car_id: UUID
    washer_id: UUID | None = None
    scheduled_at: datetime
    service_address: str = Field(min_length=5, max_length=500)
    latitude: Decimal | None = Field(default=None, ge=-90, le=90)
    longitude: Decimal | None = Field(default=None, ge=-180, le=180)
    price_cents: int = Field(ge=0, le=10_000_000)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    notes: str | None = Field(default=None, max_length=2000)

    @field_validator("currency")
    @classmethod
    def upper_currency(cls, v: str) -> str:
        return v.upper()

    @model_validator(mode="after")
    def scheduled_in_future(self) -> "BookingCreate":
        if self.scheduled_at <= datetime.now(timezone.utc):
            raise ValueError("scheduled_at must be in the future")
        return self


class BookingMilestoneUpdate(BaseModel):
    service_phase: str = Field(min_length=2, max_length=64)


class ArrivalConditionNotesUpdate(BaseModel):
    notes: str | None = Field(default=None, max_length=2000)


class BookingRead(BaseModel):
    id: UUID
    customer_id: UUID
    car_id: UUID
    washer_id: UUID | None
    status: BookingStatus
    service_phase: str | None = None
    handoff_status: HandoffStatus = HandoffStatus.none
    handoff_requested_at: datetime | None = None
    handoff_resolved_at: datetime | None = None
    scheduled_at: datetime
    service_address: str
    latitude: Decimal | None
    longitude: Decimal | None
    price_cents: int
    currency: str
    notes: str | None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class BookingReadList(BaseModel):
    items: list[BookingRead]


class BookingAdminRead(BookingRead):
    """Admin list row — includes display names for ops consoles."""

    customer_name: str | None = None
    washer_name: str | None = None
    city: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class BookingAdminReadList(BaseModel):
    items: list[BookingAdminRead]


class BookingAssignBody(BaseModel):
    washer_id: UUID


class WasherDispatchRead(BaseModel):
    id: UUID
    full_name: str
    service_area: str | None = None
    is_available: bool
    rating_avg: float

    model_config = {"from_attributes": True}


class WasherDispatchList(BaseModel):
    items: list[WasherDispatchRead]


class WasherAdminFleetRead(BaseModel):
    """Admin fleet roster — all partners with live availability + job counts."""

    id: UUID
    full_name: str
    service_area: str | None = None
    is_available: bool
    rating_avg: float
    active_jobs: int = 0
    completed7d: int = 0
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class WasherAdminFleetList(BaseModel):
    items: list[WasherAdminFleetRead]


class BookingOfferRead(BaseModel):
    """Open dispatch offer — pending booking awaiting a washer."""

    id: UUID
    scheduled_at: datetime
    service_address: str
    price_cents: int
    currency: str
    notes: str | None = None
    car_label: str | None = None
    customer_name: str | None = None

    model_config = {"from_attributes": True}


class BookingOfferList(BaseModel):
    items: list[BookingOfferRead]


class BookingStatusUpdate(BaseModel):
    status: BookingStatus

    @field_validator("status")
    @classmethod
    def washer_allowed_status(cls, v: BookingStatus) -> BookingStatus:
        if v not in (
            BookingStatus.confirmed,
            BookingStatus.in_progress,
            BookingStatus.completed,
        ):
            raise ValueError("status must be confirmed, in_progress, or completed")
        return v


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
        if self.scheduled_at <= datetime.now(timezone.utc):
            raise ValueError("scheduled_at must be in the future")
        return self


HANDOFF_ISSUE_REASON_KEYS = frozenset(
    CANCEL_REASON_KEYS
    | {
        "quality_issue",
        "incomplete_wash",
        "damage_concern",
        "missing_items",
    }
)


class BookingHandoffReportBody(BaseModel):
    reason_key: str = Field(min_length=3, max_length=64)
    reason_detail: str | None = Field(default=None, max_length=500)

    @field_validator("reason_key")
    @classmethod
    def known_handoff_reason(cls, v: str) -> str:
        if v not in HANDOFF_ISSUE_REASON_KEYS:
            raise ValueError("invalid handoff issue reason")
        return v


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


class BookingReviewSummary(BaseModel):
    id: UUID
    rating: int
    comment: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class BookingPhotoSummary(BaseModel):
    """Lightweight photo ref embedded in booking detail."""

    id: UUID
    kind: str
    url: str
    created_at: datetime


class BookingDetailRead(BaseModel):
    id: UUID
    customer_id: UUID
    car_id: UUID
    washer_id: UUID | None
    status: BookingStatus
    service_phase: str | None = None
    handoff_status: HandoffStatus = HandoffStatus.none
    handoff_requested_at: datetime | None = None
    handoff_resolved_at: datetime | None = None
    scheduled_at: datetime
    service_address: str
    latitude: Decimal | None
    longitude: Decimal | None
    price_cents: int
    currency: str
    notes: str | None
    created_at: datetime
    car_label: str | None = None
    customer_name: str | None = None
    customer_phone: str | None = None
    washer: WasherPublic | None = None
    eta_minutes: int | None = None
    timeline: list[BookingTimelineStep]
    photos: list[BookingPhotoSummary] = []
    arrival_condition_notes: str | None = None
    review: BookingReviewSummary | None = None

    model_config = {"from_attributes": True}
