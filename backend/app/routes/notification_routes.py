from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.notification_schema import NotificationListResponse, NotificationRead
from app.services import notification_service as svc

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationListResponse)
async def list_my_notifications(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> NotificationListResponse:
    items, unread = await svc.list_notifications_for_user(db, current_user.id)
    return NotificationListResponse(
        items=[NotificationRead.model_validate(n) for n in items],
        unread_count=unread,
    )


@router.patch("/{notification_id}/read", response_model=NotificationRead)
async def mark_notification_read(
    notification_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> NotificationRead:
    row = await svc.mark_notification_read(db, current_user.id, notification_id)
    return NotificationRead.model_validate(row)


@router.post("/read-all")
async def mark_all_read(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> dict[str, int]:
    count = await svc.mark_all_notifications_read(db, current_user.id)
    return {"marked": count}
