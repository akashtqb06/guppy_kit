"""Auth service — password hashing and session management."""

from __future__ import annotations

import json
import uuid
from datetime import UTC, datetime, timedelta

import bcrypt
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from guppy.auth.models import User
from guppy.auth.schemas import SessionData, UserCreate
from guppy.core.config import get_settings
from guppy.core.exceptions import GuppyError

settings = get_settings()


# ── Password utilities ────────────────────────────────────────────────────────


def hash_password(plain: str) -> str:
    """Hash a plain-text password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plain.encode(), salt).decode()


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if the plain-text password matches the bcrypt hash."""
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ── User CRUD ─────────────────────────────────────────────────────────────────


class EmailAlreadyRegisteredError(GuppyError):
    status_code = 409
    error_code = "email_already_registered"


class InvalidCredentialsError(GuppyError):
    status_code = 401
    error_code = "invalid_credentials"


async def create_user(db: AsyncSession, data: UserCreate) -> User:
    """Create a new user. Raises EmailAlreadyRegisteredError on duplicate email."""
    existing = await db.scalar(select(User).where(User.email == data.email))
    if existing is not None:
        raise EmailAlreadyRegisteredError(f"Email '{data.email}' is already registered.")
    user = User(email=data.email, hashed_password=hash_password(data.password))
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
    """Return the User if credentials are valid. Raises InvalidCredentialsError otherwise."""
    user = await db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(password, user.hashed_password):
        raise InvalidCredentialsError("Invalid email or password.")
    if not user.is_active:
        raise InvalidCredentialsError("Account is disabled.")
    return user


# ── Session management ────────────────────────────────────────────────────────

SESSION_PREFIX = "session:"


def _session_key(session_id: str) -> str:
    return f"{SESSION_PREFIX}{session_id}"


async def create_session(redis: Redis, user_id: uuid.UUID) -> str:  # type: ignore[type-arg]
    """Create a Redis session for the user. Returns the session_id."""
    session_id = str(uuid.uuid4())
    now = datetime.now(UTC)
    expires_at = now + timedelta(seconds=settings.session_ttl_seconds)
    data = SessionData(
        session_id=session_id,
        user_id=str(user_id),
        created_at=now,
        expires_at=expires_at,
    )
    await redis.setex(
        _session_key(session_id),
        settings.session_ttl_seconds,
        data.model_dump_json(),
    )
    return session_id


async def get_session(redis: Redis, session_id: str) -> SessionData | None:  # type: ignore[type-arg]
    """Return SessionData for a session_id, or None if it doesn't exist / expired."""
    raw = await redis.get(_session_key(session_id))
    if raw is None:
        return None
    return SessionData.model_validate(json.loads(raw))


async def delete_session(redis: Redis, session_id: str) -> None:  # type: ignore[type-arg]
    """Delete (invalidate) a session from Redis."""
    await redis.delete(_session_key(session_id))
