"""Auth REST API router — register, login, logout, me."""

from __future__ import annotations

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from guppy.auth.dependencies import get_current_user
from guppy.auth.models import User
from guppy.auth.schemas import UserCreate, UserLogin, UserRead
from guppy.auth.service import (
    EmailAlreadyRegisteredError,
    InvalidCredentialsError,
    LoginRateLimitError,
    authenticate_user,
    clear_failed_attempts,
    create_session,
    create_user,
    delete_session,
)
from guppy.core.config import get_settings
from guppy.core.db import get_db
from guppy.core.redis import get_redis

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()

_COOKIE_NAME = settings.session_cookie_name
_COOKIE_TTL = settings.session_ttl_seconds


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(
    body: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> User:
    """Create a new user account."""
    try:
        return await create_user(db, body)
    except EmailAlreadyRegisteredError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc


@router.post("/login", response_model=UserRead)
async def login(
    body: UserLogin,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),  # type: ignore[type-arg]
) -> User:
    ip = request.headers.get(
        "X-Forwarded-For", request.client.host if request.client else "unknown"
    )
    ip = ip.split(",")[0].strip()  # Take first IP if proxied

    try:
        user = await authenticate_user(db, body.email, body.password, ip, redis)
    except LoginRateLimitError as exc:
        raise HTTPException(
            status_code=429,
            detail=exc.message,
            headers={"Retry-After": str(exc.retry_after)},
        ) from exc
    except InvalidCredentialsError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc

    await clear_failed_attempts(redis, ip)  # Reset counter on success
    session_id = await create_session(redis, user.id)
    response.set_cookie(
        key=_COOKIE_NAME,
        value=session_id,
        httponly=True,
        samesite="lax",
        max_age=_COOKIE_TTL,
        secure=not settings.debug,
        path="/",
    )
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    guppy_session: str | None = Cookie(default=None, alias="guppy_session"),
    current_user: User = Depends(get_current_user),
    redis: Redis = Depends(get_redis),  # type: ignore[type-arg]
) -> None:
    if guppy_session:
        await delete_session(redis, guppy_session)  # ACTUALLY delete from Redis
    response.delete_cookie(key=_COOKIE_NAME, path="/")


@router.get(
    "/me",
    response_model=UserRead,
    summary="Get the current authenticated user",
)
async def me(current_user: User = Depends(get_current_user)) -> User:
    """Return the currently authenticated user's profile."""
    return current_user


@router.post("/google", summary="Google OAuth sign-in (placeholder)")
async def google_signin(body: dict) -> dict:
    raise HTTPException(501, "Google OAuth is not yet configured")
