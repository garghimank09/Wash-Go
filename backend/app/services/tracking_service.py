import logging
import math
from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.booking import Booking, BookingStatus
from app.models.user import User, UserRole
from app.models.washer import Washer
from app.models.washer_location import WasherLocation
from app.schemas.tracking_schema import (
    BookingTrackingRead,
    GeoPointRead,
    TrackingMarkerRead,
    WasherLocationUpdate,
)
from app.services import geocode_service
from app.services.booking_service import _get_washer_profile_for_user
from app.utils.exceptions import ForbiddenError, NotFoundError
from app.utils.geo import MAX_LOCAL_ROUTE_KM, haversine_km, looks_like_india

logger = logging.getLogger(__name__)

_OSRM = "https://router.project-osrm.org/route/v1/driving"
_GPS_FRESH_SECONDS = 90
_MAX_ETA_MINUTES = 120
_ROUTE_CACHE: dict[str, tuple[list[tuple[float, float]], float | None, int | None]] = {}
_LOCAL_START_OFFSET_M = 1800  # ~1.8 km — simulated washer start near customer


def _to_float(value: Decimal | float | None) -> float | None:
    if value is None:
        return None
    return float(value)


async def _ensure_booking_coords(db: AsyncSession, booking: Booking) -> tuple[float, float]:
    lat = _to_float(booking.latitude)
    lng = _to_float(booking.longitude)
    resolved = await geocode_service.resolve_service_coords(
        booking.service_address,
        lat,
        lng,
    )
    new_lat, new_lng = resolved
    if lat is None or lng is None or abs(float(lat or 0) - new_lat) > 0.01 or abs(float(lng or 0) - new_lng) > 0.01:
        booking.latitude = Decimal(str(round(new_lat, 7)))
        booking.longitude = Decimal(str(round(new_lng, 7)))
        await db.commit()
        await db.refresh(booking)
    return new_lat, new_lng


def _offset_point(lat: float, lng: float, bearing_deg: float, distance_m: float) -> tuple[float, float]:
    r = 6371000.0
    br = math.radians(bearing_deg)
    lat1 = math.radians(lat)
    lng1 = math.radians(lng)
    lat2 = math.asin(
        math.sin(lat1) * math.cos(distance_m / r)
        + math.cos(lat1) * math.sin(distance_m / r) * math.cos(br)
    )
    lng2 = lng1 + math.atan2(
        math.sin(br) * math.sin(distance_m / r) * math.cos(lat1),
        math.cos(distance_m / r) - math.sin(lat1) * math.sin(lat2),
    )
    return math.degrees(lat2), math.degrees(lng2)


def _local_washer_start(cust_lat: float, cust_lng: float) -> tuple[float, float]:
    """Place washer slightly south-west of customer until real GPS is nearby."""
    return _offset_point(cust_lat, cust_lng, 225, _LOCAL_START_OFFSET_M)


def _gps_is_plausible_for_job(
    w_lat: float, w_lng: float, cust_lat: float, cust_lng: float
) -> bool:
    return haversine_km(w_lat, w_lng, cust_lat, cust_lng) <= MAX_LOCAL_ROUTE_KM


async def _fetch_osrm_route(
    start_lat: float,
    start_lng: float,
    end_lat: float,
    end_lng: float,
) -> tuple[list[tuple[float, float]], float | None, int | None]:
    dist_km = haversine_km(start_lat, start_lng, end_lat, end_lng)
    if dist_km > MAX_LOCAL_ROUTE_KM:
        logger.warning("OSRM skipped — points %.1f km apart", dist_km)
        points = _dense_line(start_lat, start_lng, end_lat, end_lng)
        eta = int(max(3, round(dist_km / 0.5)))
        return points, dist_km * 1000, min(eta, _MAX_ETA_MINUTES)

    cache_key = f"{start_lat:.5f},{start_lng:.5f}|{end_lat:.5f},{end_lng:.5f}"
    cached = _ROUTE_CACHE.get(cache_key)
    if cached:
        return cached[0], cached[1], cached[2]

    url = f"{_OSRM}/{start_lng},{start_lat};{end_lng},{end_lat}"
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(15.0)) as client:
            response = await client.get(
                url,
                params={"overview": "full", "geometries": "geojson"},
            )
            response.raise_for_status()
            payload = response.json()
    except (httpx.HTTPError, ValueError, TypeError, KeyError) as exc:
        logger.warning("OSRM route failed: %s", exc)
        points = _dense_line(start_lat, start_lng, end_lat, end_lng)
        _ROUTE_CACHE[cache_key] = (points, dist_km * 1000, min(int(dist_km * 3), _MAX_ETA_MINUTES))
        return _ROUTE_CACHE[cache_key]

    routes = payload.get("routes") or []
    if not routes:
        points = _dense_line(start_lat, start_lng, end_lat, end_lng)
        _ROUTE_CACHE[cache_key] = (points, dist_km * 1000, min(int(dist_km * 3), _MAX_ETA_MINUTES))
        return _ROUTE_CACHE[cache_key]

    route = routes[0]
    coords = route.get("geometry", {}).get("coordinates") or []
    points = [(float(c[1]), float(c[0])) for c in coords if len(c) >= 2]
    if not points:
        points = _dense_line(start_lat, start_lng, end_lat, end_lng)
    distance_m = float(route.get("distance") or 0) or None
    duration_s = route.get("duration")
    eta_min = int(max(1, round(float(duration_s) / 60))) if duration_s else None
    if eta_min is not None:
        eta_min = min(eta_min, _MAX_ETA_MINUTES)
    _ROUTE_CACHE[cache_key] = (points, distance_m, eta_min)
    return points, distance_m, eta_min


def _dense_line(
    start_lat: float, start_lng: float, end_lat: float, end_lng: float, segments: int = 24
) -> list[tuple[float, float]]:
    return [
        (
            start_lat + (end_lat - start_lat) * i / segments,
            start_lng + (end_lng - start_lng) * i / segments,
        )
        for i in range(segments + 1)
    ]


def _interpolate_route(points: list[tuple[float, float]], t: float) -> tuple[float, float]:
    if not points:
        return 0.0, 0.0
    if len(points) == 1:
        return points[0]
    t = max(0.0, min(1.0, t))
    seg_lens: list[float] = []
    total = 0.0
    for i in range(len(points) - 1):
        a, b = points[i], points[i + 1]
        d = math.hypot(b[0] - a[0], b[1] - a[1])
        seg_lens.append(d)
        total += d
    if total <= 1e-9:
        return points[-1]
    target = t * total
    walked = 0.0
    for i, seg in enumerate(seg_lens):
        if walked + seg >= target:
            frac = (target - walked) / seg if seg > 0 else 0
            a, b = points[i], points[i + 1]
            return a[0] + (b[0] - a[0]) * frac, a[1] + (b[1] - a[1]) * frac
        walked += seg
    return points[-1]


def _simulation_progress(booking: Booking) -> float:
    now = datetime.now(timezone.utc)
    updated = booking.updated_at
    if updated.tzinfo is None:
        updated = updated.replace(tzinfo=timezone.utc)
    elapsed = max(0.0, (now - updated).total_seconds())
    return min(0.92, elapsed / (18 * 60))


async def _get_booking_for_tracking(
    db: AsyncSession, user: User, booking_id: UUID
) -> Booking:
    result = await db.execute(
        select(Booking)
        .where(Booking.id == booking_id)
        .options(
            selectinload(Booking.washer).selectinload(Washer.live_location),
            selectinload(Booking.washer).selectinload(Washer.user),
        )
    )
    booking = result.scalar_one_or_none()
    if booking is None:
        raise NotFoundError("Booking not found")

    if user.role == UserRole.admin:
        return booking
    if user.role == UserRole.customer and booking.customer_id == user.id:
        return booking
    if user.role == UserRole.washer:
        washer = await _get_washer_profile_for_user(db, user)
        if booking.washer_id == washer.id:
            return booking
        raise ForbiddenError("Not your booking")
    raise ForbiddenError("Not allowed to view tracking")


async def upsert_washer_location(
    db: AsyncSession, user: User, payload: WasherLocationUpdate
) -> None:
    washer = await _get_washer_profile_for_user(db, user)
    result = await db.execute(
        select(WasherLocation).where(WasherLocation.washer_id == washer.id)
    )
    row = result.scalar_one_or_none()
    now = datetime.now(timezone.utc)
    if row is None:
        row = WasherLocation(
            washer_id=washer.id,
            latitude=Decimal(str(round(payload.latitude, 7))),
            longitude=Decimal(str(round(payload.longitude, 7))),
            heading=payload.heading,
            updated_at=now,
        )
        db.add(row)
    else:
        row.latitude = Decimal(str(round(payload.latitude, 7)))
        row.longitude = Decimal(str(round(payload.longitude, 7)))
        row.heading = payload.heading
        row.updated_at = now
    await db.commit()


async def get_booking_tracking(
    db: AsyncSession, user: User, booking_id: UUID
) -> BookingTrackingRead:
    booking = await _get_booking_for_tracking(db, user, booking_id)
    cust_lat, cust_lng = await _ensure_booking_coords(db, booking)

    washer_marker: TrackingMarkerRead | None = None
    live = False
    simulated = False
    gps_warning: str | None = None
    start_lat: float
    start_lng: float

    loc = None
    if booking.washer and booking.washer.live_location:
        loc = booking.washer.live_location

    if loc is not None:
        w_lat = _to_float(loc.latitude) or cust_lat
        w_lng = _to_float(loc.longitude) or cust_lng
        updated = loc.updated_at
        if updated.tzinfo is None:
            updated = updated.replace(tzinfo=timezone.utc)
        age = (datetime.now(timezone.utc) - updated).total_seconds()
        gps_fresh = age <= _GPS_FRESH_SECONDS

        if _gps_is_plausible_for_job(w_lat, w_lng, cust_lat, cust_lng):
            live = gps_fresh
            washer_marker = TrackingMarkerRead(
                lat=w_lat,
                lng=w_lng,
                label=booking.washer.user.full_name if booking.washer.user else "You",
                heading=loc.heading,
                updated_at=updated,
            )
            start_lat, start_lng = w_lat, w_lng
        else:
            dist = haversine_km(w_lat, w_lng, cust_lat, cust_lng)
            logger.warning(
                "Ignoring washer GPS %.0f km from job (washer=%.4f,%.4f job=%.4f,%.4f)",
                dist,
                w_lat,
                w_lng,
                cust_lat,
                cust_lng,
            )
            gps_warning = (
                f"GPS was {int(dist)} km from the job — using route near customer. "
                "Enable location near the service area."
            )
            start_lat, start_lng = _local_washer_start(cust_lat, cust_lng)
    else:
        start_lat, start_lng = _local_washer_start(cust_lat, cust_lng)

    route_points, distance_m, eta_min = await _fetch_osrm_route(
        start_lat, start_lng, cust_lat, cust_lng
    )
    distance_km = (distance_m / 1000.0) if distance_m else haversine_km(start_lat, start_lng, cust_lat, cust_lng)

    if booking.status in (BookingStatus.confirmed, BookingStatus.in_progress):
        if washer_marker is None or not live:
            t = _simulation_progress(booking)
            sim_lat, sim_lng = _interpolate_route(route_points, t)
            simulated = True
            washer_marker = TrackingMarkerRead(
                lat=sim_lat,
                lng=sim_lng,
                label=booking.washer.user.full_name if booking.washer and booking.washer.user else "You",
                heading=None,
                updated_at=datetime.now(timezone.utc),
            )
        elif washer_marker and route_points:
            nearest_t = 0.0
            best = float("inf")
            for i in range(20):
                t = i / 19
                p = _interpolate_route(route_points, t)
                d = math.hypot(p[0] - washer_marker.lat, p[1] - washer_marker.lng)
                if d < best:
                    best = d
                    nearest_t = t
            snap = _interpolate_route(route_points, nearest_t)
            washer_marker = washer_marker.model_copy(update={"lat": snap[0], "lng": snap[1]})

    drop_label = "Customer drop-off"
    if looks_like_india(booking.service_address):
        drop_label = booking.service_address.split(",")[0].strip() or drop_label

    return BookingTrackingRead(
        booking_id=booking.id,
        status=booking.status.value,
        customer=TrackingMarkerRead(
            lat=cust_lat,
            lng=cust_lng,
            label=drop_label,
        ),
        washer=washer_marker,
        route=[GeoPointRead(lat=p[0], lng=p[1]) for p in route_points],
        eta_minutes=eta_min,
        distance_meters=distance_m,
        distance_km=round(distance_km, 2) if distance_km else None,
        live=live,
        simulated=simulated,
        gps_warning=gps_warning,
    )
