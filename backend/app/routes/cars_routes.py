"""Alias routes under `/cars` for mobile clients (same handlers as `/users/me/cars`)."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.car_schema import CarCreate, CarRead
from app.services import user_service

router = APIRouter(prefix="/cars", tags=["Cars"])


@router.post("", response_model=CarRead, status_code=status.HTTP_201_CREATED)
async def create_car(
    payload: CarCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_active_user)],
) -> CarRead:
    return await user_service.create_car_for_user(db, current, payload)


@router.get("", response_model=list[CarRead])
async def list_cars(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_active_user)],
) -> list[CarRead]:
    return await user_service.list_cars_for_user(db, current)


@router.delete("/{car_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_car(
    car_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_active_user)],
) -> None:
    await user_service.delete_car_for_user(db, current, car_id)
