from datetime import datetime

from pydantic import BaseModel


class BookingSyncState(BaseModel):
    """Lightweight fingerprint for detecting booking list changes."""

    version: str
    count: int
    updated_at: datetime | None = None
