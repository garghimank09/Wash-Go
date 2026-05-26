import asyncio
import json
from collections.abc import AsyncIterator
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import select
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user, require_admin_console, require_roles, user_has_admin_console_access
from app.auth.token_query import get_current_user_from_query_token
from app.config.settings import settings
from app.database.database import async_session_maker, get_db
from app.models.user import User, UserRole
from app.models.booking_photo import BookingPhotoKind
from app.schemas.booking_photo_schema import BookingPhotoList, BookingPhotoRead
from app.schemas.booking_schema import (
    BookingAdminReadList,
    BookingAssignBody,
    BookingCancelBody,
    BookingCreate,
    BookingDetailRead,
    BookingHandoffReportBody,
    BookingOfferList,
    BookingRead,
    BookingReadList,
    BookingRescheduleBody,
    BookingStatusUpdate,
    WasherAdminFleetList,
    WasherDispatchList,
)
from app.schemas.booking_sync_schema import BookingSyncState
from app.schemas.tracking_schema import BookingTrackingRead
from app.services import booking_photo_service, booking_service, tracking_service
from app.services.booking_sync_service import get_bookings_sync_state

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
async def create_booking(
    payload: BookingCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_roles(UserRole.customer))],
) -> BookingRead:
    booking = await booking_service.create_booking(db, current, payload)
    return booking


@router.get("", response_model=BookingReadList | BookingAdminReadList)
async def list_bookings(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_active_user)],
    scope: Annotated[str | None, Query(description="Use scope=admin for the full admin console list")] = None,
) -> BookingReadList | BookingAdminReadList:
    # Customer "My bookings" uses this path without scope — never widen via admin demo mode.
    if scope == "admin":
        if not user_has_admin_console_access(current):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin console access required",
            )
        items = await booking_service.list_bookings_admin(db)
        return BookingAdminReadList(items=items)
    items = await booking_service.list_bookings_for_user(db, current)
    return BookingReadList(items=items)


@router.get("/dispatch/washers", response_model=WasherDispatchList)
async def list_dispatch_washers(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_admin_console())],
) -> WasherDispatchList:
    items = await booking_service.list_washers_for_dispatch(db)
    return WasherDispatchList(items=items)


@router.get("/admin/fleet", response_model=WasherAdminFleetList)
async def list_admin_fleet(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_admin_console())],
) -> WasherAdminFleetList:
    items = await booking_service.list_washers_admin_fleet(db)
    return WasherAdminFleetList(items=items)


@router.patch("/{booking_id}/assign", response_model=BookingRead)
async def assign_booking(
    booking_id: UUID,
    payload: BookingAssignBody,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_admin_console())],
) -> BookingRead:
    booking = await booking_service.assign_booking_by_admin(db, booking_id, payload)
    return BookingRead.model_validate(booking)


@router.get("/sync", response_model=BookingSyncState, tags=["Bookings"])
async def bookings_sync_snapshot(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_active_user)],
) -> BookingSyncState:
    """REST snapshot for polling fallback and initial sync version."""
    return await get_bookings_sync_state(db, current)


async def _booking_sync_event_stream(user_id: UUID) -> AsyncIterator[str]:
    """SSE: emit when the user's booking fingerprint changes."""
    last_version: str | None = None
    poll = max(2.0, settings.BOOKING_SYNC_POLL_SECONDS)
    heartbeat_every = max(3, int(30 / poll))
    ticks = 0

    while True:
        async with async_session_maker() as db:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if user is None or not user.is_active:
                yield "event: error\ndata: {\"detail\":\"unauthorized\"}\n\n"
                break
            state = await get_bookings_sync_state(db, user)

        if state.version != last_version:
            last_version = state.version
            payload = state.model_dump(mode="json")
            yield f"event: bookings\ndata: {json.dumps(payload)}\n\n"
        else:
            ticks += 1
            if ticks >= heartbeat_every:
                ticks = 0
                yield ": heartbeat\n\n"

        await asyncio.sleep(poll)


@router.get("/stream", tags=["Bookings"])
async def bookings_sync_stream(
    current: Annotated[User, Depends(get_current_user_from_query_token)],
) -> StreamingResponse:
    """
    Server-Sent Events for live booking updates.
    Pass JWT as query param: `/bookings/stream?token=<access_token>` (EventSource limitation).
    """
    return StreamingResponse(
        _booking_sync_event_stream(current.id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/offers", response_model=BookingOfferList)
async def list_booking_offers(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_roles(UserRole.washer))],
) -> BookingOfferList:
    items = await booking_service.list_open_offers(db, current)
    return BookingOfferList(items=items)


@router.post("/{booking_id}/accept", response_model=BookingRead)
async def accept_booking(
    booking_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_roles(UserRole.washer))],
) -> BookingRead:
    booking = await booking_service.accept_booking(db, current, booking_id)
    return BookingRead.model_validate(booking)


@router.post("/{booking_id}/handoff/request", response_model=BookingRead)
async def request_booking_handoff(
    booking_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_roles(UserRole.washer))],
) -> BookingRead:
    booking = await booking_service.request_customer_handoff(db, current, booking_id)
    return BookingRead.model_validate(booking)


@router.post("/{booking_id}/handoff/confirm", response_model=BookingRead)
async def confirm_booking_handoff(
    booking_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_roles(UserRole.customer))],
) -> BookingRead:
    booking = await booking_service.confirm_booking_completion(db, current, booking_id)
    return BookingRead.model_validate(booking)


@router.post("/{booking_id}/handoff/report-issue", response_model=BookingRead)
async def report_booking_handoff_issue(
    booking_id: UUID,
    payload: BookingHandoffReportBody,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_roles(UserRole.customer))],
) -> BookingRead:
    booking = await booking_service.report_booking_issue(db, current, booking_id, payload)
    return BookingRead.model_validate(booking)


@router.patch("/{booking_id}/status", response_model=BookingRead)
async def update_booking_status(
    booking_id: UUID,
    payload: BookingStatusUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_roles(UserRole.washer))],
) -> BookingRead:
    booking = await booking_service.update_booking_status_for_washer(
        db, current, booking_id, payload
    )
    return BookingRead.model_validate(booking)


@router.get("/{booking_id}/tracking", response_model=BookingTrackingRead)
async def get_booking_tracking(
    booking_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_active_user)],
) -> BookingTrackingRead:
    return await tracking_service.get_booking_tracking(db, current, booking_id)


@router.get("/{booking_id}/photos", response_model=BookingPhotoList)
async def list_booking_photos(
    booking_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_active_user)],
) -> BookingPhotoList:
    items = await booking_photo_service.list_booking_photos(db, current, booking_id)
    return BookingPhotoList(items=items)


@router.post("/{booking_id}/photos", response_model=BookingPhotoRead)
async def upload_booking_photo(
    booking_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_roles(UserRole.washer))],
    kind: Annotated[BookingPhotoKind, Form()],
    file: Annotated[UploadFile, File()],
) -> BookingPhotoRead:
    return await booking_photo_service.upload_booking_photo(db, current, booking_id, kind, file)


@router.get("/{booking_id}", response_model=BookingDetailRead)
async def get_booking(
    booking_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_active_user)],
) -> BookingDetailRead:
    return await booking_service.get_booking_detail(db, current, booking_id)


@router.post("/{booking_id}/cancel", response_model=BookingRead)
async def cancel_booking(
    booking_id: UUID,
    payload: BookingCancelBody,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_roles(UserRole.customer))],
) -> BookingRead:
    booking = await booking_service.cancel_booking_for_customer(db, current, booking_id, payload)
    return BookingRead.model_validate(booking)


@router.patch("/{booking_id}/schedule", response_model=BookingRead)
async def reschedule_booking(
    booking_id: UUID,
    payload: BookingRescheduleBody,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_roles(UserRole.customer))],
) -> BookingRead:
    booking = await booking_service.reschedule_booking_for_customer(db, current, booking_id, payload)
    return BookingRead.model_validate(booking)
