import uuid
from pathlib import Path
from uuid import UUID

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.dependencies import user_has_admin_console_access
from app.config.settings import settings
from app.models.booking import Booking
from app.models.booking_photo import BookingPhoto, BookingPhotoKind
from app.models.user import User, UserRole
from app.models.washer import Washer
from app.schemas.booking_photo_schema import BookingPhotoRead
from app.utils.exceptions import ForbiddenError, NotFoundError, ValidationError

ALLOWED_CONTENT_TYPES = frozenset({"image/jpeg", "image/png", "image/webp", "image/jpg"})
EXT_BY_TYPE = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def _photo_media_url(booking_id: UUID, storage_name: str) -> str:
    return f"/media/booking_photos/{booking_id}/{storage_name}"


def _booking_photos_dir(booking_id: UUID) -> Path:
    root = Path(settings.UPLOAD_DIR) / "booking_photos" / str(booking_id)
    root.mkdir(parents=True, exist_ok=True)
    return root


async def _get_booking_for_photo_access(
    db: AsyncSession, user: User, booking_id: UUID
) -> Booking:
    result = await db.execute(
        select(Booking)
        .where(Booking.id == booking_id)
        .options(selectinload(Booking.photos))
    )
    booking = result.scalar_one_or_none()
    if booking is None:
        raise NotFoundError("Booking not found")

    if user_has_admin_console_access(user) and user.role != UserRole.customer:
        return booking
    if user.role == UserRole.washer:
        wr = await db.execute(select(Washer).where(Washer.user_id == user.id))
        washer = wr.scalar_one_or_none()
        if washer is None or booking.washer_id != washer.id:
            raise ForbiddenError("Not allowed to access photos for this booking")
        return booking
    if booking.customer_id != user.id:
        raise ForbiddenError("Not allowed to access photos for this booking")
    return booking


async def _washer_for_user(db: AsyncSession, user: User) -> Washer | None:
    if user.role != UserRole.washer:
        return None
    result = await db.execute(select(Washer).where(Washer.user_id == user.id))
    return result.scalar_one_or_none()


def _to_read(photo: BookingPhoto) -> BookingPhotoRead:
    return BookingPhotoRead(
        id=photo.id,
        booking_id=photo.booking_id,
        kind=photo.kind,
        url=_photo_media_url(photo.booking_id, photo.storage_name),
        content_type=photo.content_type,
        created_at=photo.created_at,
    )


async def list_booking_photos(
    db: AsyncSession, user: User, booking_id: UUID
) -> list[BookingPhotoRead]:
    booking = await _get_booking_for_photo_access(db, user, booking_id)
    photos = sorted(booking.photos, key=lambda p: p.kind.value)
    return [_to_read(p) for p in photos]


async def upload_booking_photo(
    db: AsyncSession,
    user: User,
    booking_id: UUID,
    kind: BookingPhotoKind,
    upload: UploadFile,
) -> BookingPhotoRead:
    if user.role != UserRole.washer:
        raise ForbiddenError("Only assigned washers can upload proof photos")

    booking = await _get_booking_for_photo_access(db, user, booking_id)
    washer = await _washer_for_user(db, user)
    if washer is None or booking.washer_id != washer.id:
        raise ForbiddenError("You must be assigned to this job to upload photos")

    if booking.status.value in ("cancelled", "completed"):
        raise ValidationError("Cannot upload photos for a finished booking")

    if kind == BookingPhotoKind.arrival and booking.washer_id is None:
        raise ValidationError("Assign a washer before uploading arrival proof")

    content_type = (upload.content_type or "image/jpeg").lower().split(";")[0].strip()
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise ValidationError("Photo must be JPEG, PNG, or WebP")

    data = await upload.read()
    if not data:
        raise ValidationError("Empty file")
    if len(data) > settings.BOOKING_PHOTO_MAX_BYTES:
        raise ValidationError("Photo must be 5 MB or smaller")

    ext = EXT_BY_TYPE.get(content_type, ".jpg")
    storage_name = f"{kind.value}_{uuid.uuid4().hex}{ext}"
    dest = _booking_photos_dir(booking_id) / storage_name
    dest.write_bytes(data)

    existing = next((p for p in booking.photos if p.kind == kind), None)
    if existing:
        old_path = _booking_photos_dir(booking_id) / existing.storage_name
        if old_path.is_file():
            try:
                old_path.unlink()
            except OSError:
                pass
        await db.delete(existing)

    photo = BookingPhoto(
        booking_id=booking_id,
        washer_id=washer.id,
        kind=kind,
        storage_name=storage_name,
        content_type=content_type,
    )
    from datetime import datetime, timezone

    booking.updated_at = datetime.now(timezone.utc)
    db.add(photo)

    if kind == BookingPhotoKind.arrival:
        allowed_phases = frozenset({"arrived_onsite", "awaiting_arrival_approval"})
        if booking.service_phase not in allowed_phases:
            raise ValidationError(
                "Mark arrived on site before uploading an arrival check-in photo"
            )
        from app.services.booking_service import _apply_service_phase

        await _apply_service_phase(db, booking, "awaiting_arrival_approval", notify=True)

    await db.commit()
    await db.refresh(photo)
    return _to_read(photo)
