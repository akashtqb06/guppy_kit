"""FastAPI dependencies for authentication."""

from __future__ import annotations

import uuid

from fastapi import Cookie, Depends, HTTPException, status
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from guppy.auth.models import User
from guppy.auth.service import get_session
from guppy.core.db import get_db
from guppy.core.redis import get_redis


async def get_current_user(
    guppy_session: str | None = Cookie(default=None, alias="guppy_session"),
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis),  # type: ignore[type-arg]
) -> User:
    """
    FastAPI dependency — resolve the authenticated user from the session cookie.

    Raises HTTP 401 if the cookie is missing, invalid, or expired.
    """
    if guppy_session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Cookie"},
        )

    session_data = await get_session(redis, guppy_session)
    if session_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid",
            headers={"WWW-Authenticate": "Cookie"},
        )

    user = await db.scalar(select(User).where(User.id == uuid.UUID(session_data.user_id)))
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or deactivated",
        )

    return user


# Convenience alias
require_auth = Depends(get_current_user)


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required"
        )
    return current_user
