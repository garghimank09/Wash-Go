import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.washer import Washer


class BookingPhotoKind(str, enum.Enum):
    before = "before"
    after = "after"


class BookingPhoto(Base):
    __tablename__ = "booking_photos"
    __table_args__ = (
        Index("ix_booking_photos_booking_kind", "booking_id", "kind", unique=True),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    booking_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("bookings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    washer_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("washers.id", ondelete="SET NULL"),
        nullable=True,
    )
    kind: Mapped[BookingPhotoKind] = mapped_column(
        Enum(BookingPhotoKind, name="booking_photo_kind", native_enum=False, length=16),
        nullable=False,
    )
    storage_name: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(64), nullable=False, default="image/jpeg")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    booking: Mapped["Booking"] = relationship("Booking", back_populates="photos")
    washer: Mapped["Washer | None"] = relationship("Washer")
