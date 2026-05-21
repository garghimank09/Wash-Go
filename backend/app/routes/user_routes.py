from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.car_schema import CarCreate, CarRead
from app.schemas.user_schema import CustomerProfileRead, CustomerProfileUpdate
from app.services import customer_profile_service, user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me/profile", response_model=CustomerProfileRead)
async def get_my_profile(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_active_user)],
) -> CustomerProfileRead:
    return await customer_profile_service.get_customer_profile(db, current)


@router.patch("/me/profile", response_model=CustomerProfileRead)
async def update_my_profile(
    payload: CustomerProfileUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_active_user)],
) -> CustomerProfileRead:
    return await customer_profile_service.update_customer_profile(db, current, payload)


@router.post("/me/avatar", response_model=CustomerProfileRead)
async def upload_my_avatar(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_active_user)],
    file: UploadFile = File(...),
) -> CustomerProfileRead:
    return await customer_profile_service.upload_customer_avatar(db, current, file)


@router.post("/me/cars", response_model=CarRead, status_code=status.HTTP_201_CREATED)
async def add_my_car(
    payload: CarCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_active_user)],
) -> CarRead:
    car = await user_service.create_car_for_user(db, current, payload)
    return car


@router.get("/me/cars", response_model=list[CarRead])
async def list_my_cars(
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_active_user)],
) -> list[CarRead]:
    cars = await user_service.list_cars_for_user(db, current)
    return cars


@router.delete("/me/cars/{car_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_car(
    car_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current: Annotated[User, Depends(get_current_active_user)],
) -> None:
    await user_service.delete_car_for_user(db, current, car_id)
