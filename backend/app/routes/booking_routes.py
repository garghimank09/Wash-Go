from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user, require_roles
from app.database.database import get_db
from app.models.user import User, UserRole
from app.schemas.booking_schema import (
    BookingCancelBody,
    BookingCreate,
    BookingDetailRead,
    BookingRead,
    BookingReadList,
    BookingRescheduleBody,
)
from app.services import booking_service

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
async def create_booking(
    payload: BookingCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(require_roles(UserRole.customer))],
) -> BookingRead:
    booking = await booking_service.create_booking(db, current, payload)
    return booking


@router.get("", response_model=BookingReadList)
async def list_bookings(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_active_user)],
) -> BookingReadList:
    items = await booking_service.list_bookings_for_user(db, current)
    return BookingReadList(items=items)


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
