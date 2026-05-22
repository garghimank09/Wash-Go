from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel


class NotificationRead(BaseModel):
    id: UUID
    title: str
    body: str
    read: bool
    notification_type: str
    data: dict[str, Any] | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class NotificationListResponse(BaseModel):
    items: list[NotificationRead]
    unread_count: int
