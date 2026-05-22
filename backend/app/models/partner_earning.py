import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.washer import Washer

PARTNER_SHARE_RATE = 0.9


class PartnerEarningStatus(str, enum.Enum):
    pending_weekly = "pending_weekly"
    paid = "paid"


class PartnerEarning(Base):
    """Partner share (90%) recorded when a booking is accepted; paid out weekly by admin."""

    __tablename__ = "partner_earnings"
    __table_args__ = (
        Index("ix_partner_earnings_washer_earned", "washer_id", "earned_at"),
        Index("ix_partner_earnings_booking", "booking_id", unique=True),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    booking_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False
    )
    washer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("washers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    gross_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    partner_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[PartnerEarningStatus] = mapped_column(
        Enum(PartnerEarningStatus, name="partner_earning_status", native_enum=False, length=32),
        nullable=False,
        default=PartnerEarningStatus.pending_weekly,
    )
    earned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    booking: Mapped["Booking"] = relationship("Booking", foreign_keys=[booking_id])
    washer: Mapped["Washer"] = relationship("Washer", foreign_keys=[washer_id])


def partner_share_cents(gross_cents: int) -> int:
    return int(gross_cents * PARTNER_SHARE_RATE)
