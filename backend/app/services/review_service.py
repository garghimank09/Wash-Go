from decimal import Decimal, ROUND_HALF_UP
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.dependencies import user_has_admin_console_access
from app.models.booking import Booking, BookingStatus
from app.models.review import Review
from app.models.user import User, UserRole
from app.models.washer import Washer
from app.schemas.review_schema import ReviewAdminRead, ReviewCreate, ReviewPartnerRead, ReviewRead
from app.utils.exceptions import ConflictError, ForbiddenError, NotFoundError, ValidationError


async def _get_booking_for_customer(
    db: AsyncSession, customer_id: UUID, booking_id: UUID
) -> Booking:
    result = await db.execute(
        select(Booking)
        .where(Booking.id == booking_id, Booking.customer_id == customer_id)
        .options(
            selectinload(Booking.washer).selectinload(Washer.user),
            selectinload(Booking.reviews),
        )
    )
    booking = result.scalar_one_or_none()
    if booking is None:
        raise NotFoundError("Booking not found")
    return booking


async def _recalculate_washer_rating(db: AsyncSession, washer_user_id: UUID) -> None:
    avg_result = await db.execute(
        select(func.avg(Review.rating)).where(Review.reviewee_id == washer_user_id)
    )
    avg_val = avg_result.scalar()
    if avg_val is None:
        return
    washer_result = await db.execute(select(Washer).where(Washer.user_id == washer_user_id))
    washer = washer_result.scalar_one_or_none()
    if washer is None:
        return
    washer.rating_avg = Decimal(str(avg_val)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _review_to_read(review: Review) -> ReviewRead:
    reviewer_name = review.reviewer.full_name if review.reviewer else None
    reviewee_name = review.reviewee.full_name if review.reviewee else None
    return ReviewRead(
        id=review.id,
        booking_id=review.booking_id,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
        reviewer_name=reviewer_name,
        reviewee_name=reviewee_name,
    )


async def create_review_for_booking(
    db: AsyncSession, customer: User, booking_id: UUID, payload: ReviewCreate
) -> ReviewRead:
    if customer.role != UserRole.customer:
        raise ForbiddenError("Only customers can submit washer reviews")

    booking = await _get_booking_for_customer(db, customer.id, booking_id)

    if booking.status != BookingStatus.completed:
        raise ValidationError("You can review your washer after the wash is completed")
    if booking.washer_id is None or booking.washer is None or booking.washer.user is None:
        raise ValidationError("No washer assigned to this booking")
    if booking.reviews:
        raise ConflictError("You already reviewed this wash")

    comment = payload.comment.strip() if payload.comment else None
    if payload.rating <= 2 and (not comment or len(comment) < 8):
        raise ValidationError("Please add a short comment when rating 2 stars or below")

    review = Review(
        booking_id=booking.id,
        reviewer_id=customer.id,
        reviewee_id=booking.washer.user_id,
        rating=payload.rating,
        comment=comment or None,
    )
    db.add(review)
    try:
        await db.flush()
        await _recalculate_washer_rating(db, booking.washer.user_id)
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise ConflictError("You already reviewed this wash") from exc

    result = await db.execute(
        select(Review)
        .where(Review.id == review.id)
        .options(
            selectinload(Review.reviewer),
            selectinload(Review.reviewee),
        )
    )
    saved = result.scalar_one()
    return _review_to_read(saved)


async def get_review_for_booking(
    db: AsyncSession, user: User, booking_id: UUID
) -> ReviewRead | None:
    stmt = (
        select(Booking)
        .where(Booking.id == booking_id)
        .options(
            selectinload(Booking.reviews).selectinload(Review.reviewer),
            selectinload(Booking.reviews).selectinload(Review.reviewee),
            selectinload(Booking.washer).selectinload(Washer.user),
        )
    )
    result = await db.execute(stmt)
    booking = result.scalar_one_or_none()
    if booking is None:
        raise NotFoundError("Booking not found")

    if user_has_admin_console_access(user):
        pass
    elif user.role == UserRole.washer:
        wr = await db.execute(select(Washer).where(Washer.user_id == user.id))
        washer = wr.scalar_one_or_none()
        if washer is None or booking.washer_id != washer.id:
            raise ForbiddenError("Not allowed to view this booking")
    else:
        if booking.customer_id != user.id:
            raise ForbiddenError("Not allowed to view this booking")

    if not booking.reviews:
        return None
    return _review_to_read(booking.reviews[0])


async def list_reviews_admin(db: AsyncSession, limit: int = 100) -> list[ReviewAdminRead]:
    result = await db.execute(
        select(Review)
        .options(
            selectinload(Review.reviewer),
            selectinload(Review.reviewee),
            selectinload(Review.booking),
        )
        .order_by(Review.created_at.desc())
        .limit(limit)
    )
    reviews = result.scalars().all()
    items: list[ReviewAdminRead] = []
    for review in reviews:
        base = _review_to_read(review)
        booking = review.booking
        items.append(
            ReviewAdminRead(
                **base.model_dump(),
                service_address=booking.service_address if booking else None,
                booking_status=booking.status.value if booking else None,
            )
        )
    return items


async def list_reviews_for_partner(db: AsyncSession, user: User, limit: int = 50) -> list[ReviewPartnerRead]:
    if user.role != UserRole.washer:
        raise ForbiddenError("Only partners can list their feedback")

    result = await db.execute(
        select(Review)
        .where(Review.reviewee_id == user.id)
        .options(
            selectinload(Review.reviewer),
            selectinload(Review.reviewee),
            selectinload(Review.booking),
        )
        .order_by(Review.created_at.desc())
        .limit(limit)
    )
    reviews = result.scalars().all()
    items: list[ReviewPartnerRead] = []
    for review in reviews:
        base = _review_to_read(review)
        booking = review.booking
        items.append(
            ReviewPartnerRead(
                **base.model_dump(),
                service_address=booking.service_address if booking else None,
            )
        )
    return items
