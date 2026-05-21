import uuid
from pathlib import Path

from fastapi import UploadFile

from app.config.settings import settings
from app.models.user import User
from app.utils.exceptions import ValidationError

ALLOWED_CONTENT_TYPES = frozenset({"image/jpeg", "image/png", "image/webp", "image/jpg"})
EXT_BY_TYPE = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def avatar_media_url(user_id: uuid.UUID, storage_name: str) -> str:
    return f"/media/user_avatars/{user_id}/{storage_name}"


def avatar_dir(user_id: uuid.UUID) -> Path:
    root = Path(settings.UPLOAD_DIR) / "user_avatars" / str(user_id)
    root.mkdir(parents=True, exist_ok=True)
    return root


async def save_user_avatar(user: User, upload: UploadFile) -> str:
    """Persist avatar file; sets user.avatar_storage_name. Caller must commit."""
    content_type = (upload.content_type or "image/jpeg").lower().split(";")[0].strip()
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise ValidationError("Photo must be JPEG, PNG, or WebP")

    data = await upload.read()
    if not data:
        raise ValidationError("Empty file")
    if len(data) > settings.BOOKING_PHOTO_MAX_BYTES:
        raise ValidationError("Photo must be 5 MB or smaller")

    ext = EXT_BY_TYPE.get(content_type, ".jpg")
    storage_name = f"avatar_{uuid.uuid4().hex}{ext}"
    dest_dir = avatar_dir(user.id)

    if user.avatar_storage_name:
        for folder in ("user_avatars", "partner_avatars"):
            old_path = Path(settings.UPLOAD_DIR) / folder / str(user.id) / user.avatar_storage_name
            if old_path.is_file():
                try:
                    old_path.unlink()
                except OSError:
                    pass

    dest = dest_dir / storage_name
    dest.write_bytes(data)
    user.avatar_storage_name = storage_name
    return storage_name
