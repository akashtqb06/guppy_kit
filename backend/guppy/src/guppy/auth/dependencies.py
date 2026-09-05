"""FastAPI dependencies for authentication."""

from __future__ import annotations

import json
import uuid

from fastapi import Cookie, Depends, HTTPException, status
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from guppy.auth.models import User
from guppy.auth.rbac import Permission
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


async def get_user_permissions(
    user: User,
    redis: Redis,  # type: ignore[type-arg]
) -> set[str]:
    """Return the set of permission codes for the user. Results cached in Redis (60s)."""
    cache_key = f"user:perms:{user.id}"
    cached = await redis.get(cache_key)
    if cached:
        return set(json.loads(cached))

    perms: set[str] = set()
    for role in user.roles:
        for perm in role.permissions:
            perms.add(perm.code)

    # Superadmin shortcut — all permissions
    if any(r.name == "superadmin" for r in user.roles):
        perms = {p.value for p in Permission}

    await redis.setex(cache_key, 60, json.dumps(list(perms)))
    return perms


def require_permission(permission: Permission):
    """FastAPI dependency factory — raises 403 if user lacks the permission."""

    async def _check(
        current_user: User = Depends(get_current_user),
        redis: Redis = Depends(get_redis),  # type: ignore[type-arg]
    ) -> User:
        perms = await get_user_permissions(current_user, redis)
        if permission.value not in perms:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission required: {permission.value}",
            )
        return current_user

    return Depends(_check)


def require_role(role_name: str):
    """FastAPI dependency factory — raises 403 if user doesn't have the role."""

    async def _check(current_user: User = Depends(get_current_user)) -> User:
        if not any(r.name == role_name for r in current_user.roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role required: {role_name}",
            )
        return current_user

    return Depends(_check)


# Keep is_admin check for backward compatibility
async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required"
        )
    return current_user
