from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.auth_cookies import (
    clear_all_auth_cookies,
    set_customer_auth_cookie,
    set_partner_auth_cookie,
)
from app.auth.dependencies import get_current_active_user
from app.auth.jwt_handler import build_token_response
from app.auth.password_handler import verify_password
from app.database.database import get_db
from app.models.auth_otp import OtpPurpose
from app.models.user import User, UserRole
from app.schemas.auth_schema import Token
from app.schemas.otp_schema import OtpSendRequest, OtpSendResponse, OtpPurposeEnum
from app.schemas.user_schema import PasswordResetRequest, PartnerSignup, UserCreate, UserLogin, UserRead
from app.services import otp_service, user_service
from app.utils.exceptions import ValidationError, WashGoError

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _map_purpose(purpose: OtpPurposeEnum) -> OtpPurpose:
    return OtpPurpose(purpose.value)


def _issue_token(response: Response, user: User) -> Token:
    payload = build_token_response(user.id, user.role)
    if user.role == UserRole.washer:
        set_partner_auth_cookie(response, payload["access_token"])
    else:
        set_customer_auth_cookie(response, payload["access_token"])
    return Token(**payload)


@router.post("/otp/send", response_model=OtpSendResponse)
async def send_otp(
    payload: OtpSendRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> OtpSendResponse:
    """Send a 6-digit OTP via email or SMS (skipped for @washgo.demo accounts)."""
    try:
        result = await otp_service.send_otp(
            db,
            _map_purpose(payload.purpose),
            email=str(payload.email) if payload.email else None,
            phone=payload.phone,
            role_hint=payload.role_hint,
        )
        return OtpSendResponse(**result)
    except WashGoError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(
    payload: UserCreate,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Token:
    try:
        await otp_service.require_valid_otp(
            db,
            str(payload.email),
            OtpPurpose.signup,
            payload.otp_code,
            phone=payload.phone,
        )
        user = await user_service.create_user(db, payload)
        return _issue_token(response, user)
    except WashGoError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc


@router.post("/partner/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def partner_signup(
    payload: PartnerSignup,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Token:
    """Public registration for field partners — creates `washer` role user + linked washer profile."""
    try:
        await otp_service.require_valid_otp(
            db,
            str(payload.email),
            OtpPurpose.signup,
            payload.otp_code,
            phone=payload.phone,
        )
        user = await user_service.create_partner_user(db, payload)
        return _issue_token(response, user)
    except WashGoError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc


@router.post("/login", response_model=Token)
async def login(
    payload: UserLogin,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Token:
    user = await user_service.get_user_by_phone(db, payload.phone)
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect mobile number or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")

    email = user.email.lower()
    try:
        await otp_service.require_valid_otp(
            db, email, OtpPurpose.login, payload.otp_code, phone=payload.phone
        )
    except ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=exc.message) from exc

    return _issue_token(response, user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response) -> None:
    """Clear session cookies (client should also clear local storage)."""
    clear_all_auth_cookies(response)


@router.post("/password/reset", response_model=dict)
async def reset_password(
    payload: PasswordResetRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Reset password using email OTP (same flow as login/signup verification)."""
    user = await user_service.get_user_by_phone(db, payload.phone)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No account found for this phone number")
    email = user.email.lower()
    try:
        await otp_service.require_valid_otp(
            db, email, OtpPurpose.password_reset, payload.otp_code, phone=payload.phone
        )
        await user_service.reset_password(db, email, payload.new_password)
        return {"message": "Password updated. You can sign in with your new password."}
    except WashGoError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc


@router.get("/me", response_model=UserRead)
async def read_me(current: Annotated[User, Depends(get_current_active_user)]) -> User:
    return current
