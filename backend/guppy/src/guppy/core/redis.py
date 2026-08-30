"""Async Redis client and FastAPI dependency."""

from __future__ import annotations

from collections.abc import AsyncGenerator

from redis.asyncio import Redis
from redis.asyncio.connection import ConnectionPool

from guppy.core.config import get_settings

settings = get_settings()

_pool: ConnectionPool | None = None


def get_pool() -> ConnectionPool:
    """Return (or lazily create) the global Redis connection pool."""
    global _pool
    if _pool is None:
        _pool = ConnectionPool.from_url(
            settings.redis_url,
            max_connections=20,
            decode_responses=True,
        )
    return _pool


async def get_redis() -> AsyncGenerator[Redis, None]:  # type: ignore[type-arg]
    """FastAPI dependency — yields a Redis client from the shared pool."""
    client: Redis = Redis(connection_pool=get_pool())  # type: ignore[type-arg]
    try:
        yield client
    finally:
        await client.aclose()
