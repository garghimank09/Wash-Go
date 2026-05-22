from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user
from app.auth.jwt_handler import create_access_token
from app.auth.password_handler import verify_password
from app.database.database import get_db
from app.models.auth_otp import OtpPurpose
from app.models.user import User
from app.schemas.auth_schema import Token
from app.schemas.otp_schema import OtpSendRequest, OtpSendResponse, OtpPurposeEnum
from app.schemas.user_schema import PasswordResetRequest, PartnerSignup, UserCreate, UserLogin, UserRead
from app.services import otp_service, user_service
from app.utils.demo_accounts import is_demo_email
from app.utils.exceptions import ValidationError, WashGoError

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _map_purpose(purpose: OtpPurposeEnum) -> OtpPurpose:
    return OtpPurpose(purpose.value)


@router.post("/otp/send", response_model=OtpSendResponse)
async def send_otp(
    payload: OtpSendRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> OtpSendResponse:
    """Send a 6-digit OTP to the user's email (skipped for @washgo.demo accounts)."""
    try:
        result = await otp_service.send_otp(
            db,
            str(payload.email),
            _map_purpose(payload.purpose),
            role_hint=payload.role_hint,
        )
        return OtpSendResponse(**result)
    except WashGoError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserCreate, db: Annotated[AsyncSession, Depends(get_db)]) -> Token:
    try:
        await otp_service.require_valid_otp(
            db, str(payload.email), OtpPurpose.signup, payload.otp_code
        )
        user = await user_service.create_user(db, payload)
        return Token(access_token=create_access_token(user.id, user.role))
    except WashGoError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc


@router.post("/partner/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def partner_signup(payload: PartnerSignup, db: Annotated[AsyncSession, Depends(get_db)]) -> Token:
    """Public registration for field partners — creates `washer` role user + linked washer profile."""
    try:
        await otp_service.require_valid_otp(
            db, str(payload.email), OtpPurpose.signup, payload.otp_code
        )
        user = await user_service.create_partner_user(db, payload)
        return Token(access_token=create_access_token(user.id, user.role))
    except WashGoError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc


@router.post("/login", response_model=Token)
async def login(payload: UserLogin, db: Annotated[AsyncSession, Depends(get_db)]) -> Token:
    email = str(payload.email).lower()
    user = await user_service.get_user_by_email(db, email)
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")

    try:
        await otp_service.require_valid_otp(db, email, OtpPurpose.login, payload.otp_code)
    except ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=exc.message) from exc

    access_token = create_access_token(user.id, user.role)
    return Token(access_token=access_token)


@router.post("/password/reset", response_model=dict)
async def reset_password(
    payload: PasswordResetRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """Reset password using email OTP (same flow as login/signup verification)."""
    email = str(payload.email).lower()
    try:
        await otp_service.require_valid_otp(
            db, email, OtpPurpose.password_reset, payload.otp_code
        )
        await user_service.reset_password(db, email, payload.new_password)
        return {"message": "Password updated. You can sign in with your new password."}
    except WashGoError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc


@router.get("/me", response_model=UserRead)
async def read_me(current: Annotated[User, Depends(get_current_active_user)]) -> User:
    return current
