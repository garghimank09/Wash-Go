import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, Index, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.car import Car
    from app.models.membership import UserMembership
    from app.models.notification import Notification
    from app.models.review import Review
    from app.models.washer import Washer


class UserRole(str, enum.Enum):
    customer = "customer"
    washer = "washer"
    admin = "admin"


class User(Base):
    __tablename__ = "users"
    __table_args__ = (Index("ix_users_email_active", "email", "is_active"),)

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role", native_enum=False, length=32),
        nullable=False,
        default=UserRole.customer,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    cars: Mapped[list["Car"]] = relationship("Car", back_populates="owner", cascade="all, delete-orphan")
    bookings: Mapped[list["Booking"]] = relationship(
        "Booking", back_populates="customer", foreign_keys="Booking.customer_id"
    )
    washer_profile: Mapped["Washer | None"] = relationship(
        "Washer", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    reviews_written: Mapped[list["Review"]] = relationship(
        "Review", back_populates="reviewer", foreign_keys="Review.reviewer_id"
    )
    reviews_received: Mapped[list["Review"]] = relationship(
        "Review", back_populates="reviewee", foreign_keys="Review.reviewee_id"
    )
    memberships: Mapped[list["UserMembership"]] = relationship(
        "UserMembership", back_populates="user", cascade="all, delete-orphan"
    )
    notifications: Mapped[list["Notification"]] = relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan"
    )
