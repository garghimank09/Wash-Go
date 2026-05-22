from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user, require_roles
from app.database.database import get_db
from app.models.user import User, UserRole
from app.schemas.user_membership_schema import (
    MembershipSubscribeRequest,
    UserMembershipRead,
    UserMembershipReadOptional,
)
from app.services import user_membership_service as svc

router = APIRouter(prefix="/memberships", tags=["Memberships"])


@router.get("/me", response_model=UserMembershipReadOptional)
async def get_my_membership(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles(UserRole.customer))],
) -> UserMembershipReadOptional:
    row = await svc.get_current_membership_display(db, current_user)
    if row is None:
        return UserMembershipReadOptional(membership=None)
    return UserMembershipReadOptional(membership=svc.membership_to_read(row))


@router.post("/subscribe", response_model=UserMembershipRead)
async def subscribe_membership_demo(
    payload: MembershipSubscribeRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_roles(UserRole.customer))],
) -> UserMembershipRead:
    return await svc.subscribe_customer_demo(db, current_user, payload.plan_slug)
