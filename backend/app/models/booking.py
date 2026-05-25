import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.booking_photo import BookingPhoto
    from app.models.car import Car
    from app.models.payment import Payment
    from app.models.review import Review
    from app.models.user import User
    from app.models.washer import Washer


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (
        Index("ix_bookings_customer_status", "customer_id", "status"),
        Index("ix_bookings_washer_scheduled", "washer_id", "scheduled_at"),
        Index("ix_bookings_scheduled_at", "scheduled_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    car_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cars.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    washer_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("washers.id", ondelete="SET NULL"), nullable=True, index=True
    )
    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, name="booking_status", native_enum=False, length=32),
        nullable=False,
        default=BookingStatus.pending,
        index=True,
    )
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    service_address: Mapped[str] = mapped_column(String(500), nullable=False)
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(10, 7), nullable=True)
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(10, 7), nullable=True)
    price_cents: Mapped[int] = mapped_column(nullable=False, default=0)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="INR")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    service_phase: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    customer: Mapped["User"] = relationship("User", back_populates="bookings", foreign_keys=[customer_id])
    car: Mapped["Car"] = relationship("Car", back_populates="bookings")
    washer: Mapped["Washer | None"] = relationship("Washer", back_populates="bookings", foreign_keys=[washer_id])
    payments: Mapped[list["Payment"]] = relationship("Payment", back_populates="booking", cascade="all, delete-orphan")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="booking", cascade="all, delete-orphan")
    photos: Mapped[list["BookingPhoto"]] = relationship(
        "BookingPhoto", back_populates="booking", cascade="all, delete-orphan"
    )
