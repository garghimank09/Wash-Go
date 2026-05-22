from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import require_admin_console
from app.database.database import get_db
from app.models.user import User
from app.schemas.membership_plan_schema import (
    MembershipPlanAdminRead,
    MembershipPlanAdminReadList,
    MembershipPlanCreate,
    MembershipPlanRead,
    MembershipPlanReadList,
    MembershipPlanUpdate,
)
from app.services import membership_plan_service as svc

router = APIRouter(prefix="/membership-plans", tags=["Membership plans"])


@router.get("", response_model=MembershipPlanReadList)
async def list_membership_plans(db: Annotated[AsyncSession, Depends(get_db)]) -> MembershipPlanReadList:
    items = await svc.list_active_membership_plans(db)
    return MembershipPlanReadList(items=[MembershipPlanRead.model_validate(p) for p in items])


@router.get("/all", response_model=MembershipPlanAdminReadList)
async def list_all_membership_plans_admin(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(require_admin_console())],
) -> MembershipPlanAdminReadList:
    items = await svc.list_all_membership_plans(db)
    return MembershipPlanAdminReadList(
        items=[MembershipPlanAdminRead.model_validate(p) for p in items]
    )


@router.post("", response_model=MembershipPlanAdminRead, status_code=status.HTTP_201_CREATED)
async def create_membership_plan(
    payload: MembershipPlanCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(require_admin_console())],
) -> MembershipPlanAdminRead:
    try:
        plan = await svc.create_membership_plan(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e)) from e
    return MembershipPlanAdminRead.model_validate(plan)


@router.patch("/{slug}", response_model=MembershipPlanAdminRead)
async def update_membership_plan(
    slug: str,
    payload: MembershipPlanUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(require_admin_console())],
) -> MembershipPlanAdminRead:
    try:
        plan = await svc.update_membership_plan(db, slug.strip().lower(), payload)
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    return MembershipPlanAdminRead.model_validate(plan)


@router.delete("/{slug}", response_model=MembershipPlanAdminRead)
async def deactivate_membership_plan(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(require_admin_console())],
) -> MembershipPlanAdminRead:
    try:
        plan = await svc.deactivate_membership_plan(db, slug.strip().lower())
    except LookupError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    return MembershipPlanAdminRead.model_validate(plan)
