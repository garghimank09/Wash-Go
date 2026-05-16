from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.booking_photo import BookingPhotoKind


class BookingPhotoRead(BaseModel):
    id: UUID
    booking_id: UUID
    kind: BookingPhotoKind
    url: str
    content_type: str
    created_at: datetime

    model_config = {"from_attributes": True}


class BookingPhotoList(BaseModel):
    items: list[BookingPhotoRead]
