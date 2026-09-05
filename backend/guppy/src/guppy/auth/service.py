"""Auth service — password hashing and session management."""

from __future__ import annotations

import json
import uuid
from datetime import UTC, datetime, timedelta

import bcrypt
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from guppy.auth.models import LoginEvent, User
from guppy.auth.schemas import SessionData, UserCreate
from guppy.core.config import get_settings
from guppy.core.exceptions import GuppyError

settings = get_settings()

# Pre-computed dummy hash — used to run bcrypt even when user is not found
# This prevents timing-oracle attacks that distinguish "user not found" from "wrong password"
_DUMMY_HASH: str = bcrypt.hashpw(b"__dummy_guppy_password__", bcrypt.gensalt()).decode()


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


class LoginRateLimitError(GuppyError):
    status_code = 429
    error_code = "rate_limited"

    def __init__(self, message: str, retry_after: int = 900) -> None:
        super().__init__(message)
        self.retry_after = retry_after


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


_LOCKOUT_PREFIX = "auth:lockout:"
_ATTEMPT_PREFIX = "auth:attempts:"


async def check_login_ratelimit(redis: Redis, ip: str) -> None:  # type: ignore[type-arg]
    """Raise HTTP 429 if the IP is currently locked out."""
    lockout_key = f"{_LOCKOUT_PREFIX}{ip}"
    locked = await redis.get(lockout_key)
    if locked:
        ttl = await redis.ttl(lockout_key)
        raise LoginRateLimitError(
            f"Too many failed attempts. Try again in {ttl} seconds.", retry_after=ttl
        )


async def record_failed_attempt(redis: Redis, ip: str) -> None:  # type: ignore[type-arg]
    """Increment failed attempt counter. Lock out IP after threshold."""
    attempt_key = f"{_ATTEMPT_PREFIX}{ip}"
    lockout_key = f"{_LOCKOUT_PREFIX}{ip}"

    pipe = redis.pipeline()
    pipe.incr(attempt_key)
    pipe.expire(attempt_key, settings.auth_lockout_window_seconds)
    results = await pipe.execute()
    attempts = results[0]

    if attempts >= settings.auth_max_login_attempts:
        await redis.setex(lockout_key, settings.auth_lockout_duration_seconds, "1")
        await redis.delete(attempt_key)


async def clear_failed_attempts(redis: Redis, ip: str) -> None:  # type: ignore[type-arg]
    """Clear attempt counter after successful login."""
    await redis.delete(f"{_ATTEMPT_PREFIX}{ip}")


async def authenticate_user(
    db: AsyncSession,
    email: str,
    password: str,
    ip_address: str,
    redis: Redis,  # type: ignore[type-arg]
) -> User:
    """Constant-time credential check. Always runs bcrypt regardless of whether user exists."""
    # 1. Check brute-force lockout BEFORE doing any DB work
    await check_login_ratelimit(redis, ip_address)

    # 2. Fetch user (timing-safe: always run bcrypt)
    user = await db.scalar(select(User).where(User.email == email))
    hashed = user.hashed_password if user is not None else _DUMMY_HASH
    password_ok = bcrypt.checkpw(password.encode(), hashed.encode())

    # 3. Determine outcome
    success = user is not None and password_ok and user.is_active

    # 4. Record login event
    event = LoginEvent(
        email_attempted=email,
        ip_address=ip_address,
        success=success,
        failure_reason=None
        if success
        else ("account_disabled" if (user and not user.is_active) else "invalid_credentials"),
        user_id=user.id if success else None,
    )
    db.add(event)
    await db.flush()  # non-blocking, commits with request transaction

    # 5. Track failed attempts
    if not success:
        await record_failed_attempt(redis, ip_address)
        # Always same error — never reveal whether email exists
        raise InvalidCredentialsError("Invalid email or password.")

    return user  # type: ignore[return-value]


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


async def get_session_id_from_cookie(cookie_value: str) -> str:
    """Extract the session_id (the cookie IS the session_id)."""
    return cookie_value  # session_id is stored directly as the cookie value
