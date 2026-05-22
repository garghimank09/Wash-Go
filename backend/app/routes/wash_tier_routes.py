from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import require_admin_console
from app.database.database import get_db
from app.models.user import User
from app.schemas.wash_tier_schema import (
    WashTierAdminRead,
    WashTierAdminReadList,
    WashTierCreate,
    WashTierRead,
    WashTierReadList,
    WashTierUpdate,
)
from app.services import wash_tier_service as svc

router = APIRouter(prefix="/wash-tiers", tags=["Wash tiers"])


@router.get("", response_model=WashTierReadList)
async def list_wash_tiers(db: Annotated[AsyncSession, Depends(get_db)]) -> WashTierReadList:
    items = await svc.list_active_wash_tiers(db)
    return WashTierReadList(items=[WashTierRead.model_validate(t) for t in items])


@router.get("/all", response_model=WashTierAdminReadList)
async def list_all_wash_tiers_admin(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(require_admin_console())],
) -> WashTierAdminReadList:
    items = await svc.list_all_wash_tiers(db)
    return WashTierAdminReadList(items=[WashTierAdminRead.model_validate(t) for t in items])


@router.post("", response_model=WashTierAdminRead, status_code=status.HTTP_201_CREATED)
async def create_wash_tier(
    payload: WashTierCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(require_admin_console())],
) -> WashTierAdminRead:
    try:
        tier = await svc.create_wash_tier(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e)) from e
    return WashTierAdminRead.model_validate(tier)


@router.patch("/{slug}", response_model=WashTierAdminRead)
async def update_wash_tier(
    slug: str,
    payload: WashTierUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(require_admin_console())],
) -> WashTierAdminRead:
    try:
        tier = await svc.update_wash_tier(db, slug.strip().lower(), payload)
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    return WashTierAdminRead.model_validate(tier)


@router.delete("/{slug}", response_model=WashTierAdminRead)
async def deactivate_wash_tier(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(require_admin_console())],
) -> WashTierAdminRead:
    try:
        tier = await svc.deactivate_wash_tier(db, slug.strip().lower())
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    return WashTierAdminRead.model_validate(tier)
