from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class GeoPointRead(BaseModel):
    lat: float
    lng: float


class TrackingMarkerRead(BaseModel):
    lat: float
    lng: float
    label: str | None = None
    heading: float | None = None
    updated_at: datetime | None = None


class BookingTrackingRead(BaseModel):
    booking_id: UUID
    status: str
    customer: TrackingMarkerRead
    washer: TrackingMarkerRead | None = None
    route: list[GeoPointRead] = Field(default_factory=list)
    eta_minutes: int | None = None
    distance_meters: float | None = None
    distance_km: float | None = None
    live: bool = False
    simulated: bool = False
    gps_warning: str | None = None


class WasherLocationUpdate(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    heading: float | None = Field(default=None, ge=0, le=360)
