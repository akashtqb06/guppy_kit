"""Platform-wide settings loaded from environment variables."""

from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────────────
    app_name: str = "Guppy Kit"
    app_version: str = "0.1.0"
    debug: bool = False

    # ── Database ─────────────────────────────────────────────────────────
    database_url: str = Field(
        default="postgresql+asyncpg://guppy:guppy@localhost:5432/guppy",
        description="Async PostgreSQL DSN",
    )
    db_pool_size: int = 10
    db_max_overflow: int = 20
    db_echo: bool = False

    # ── Redis ────────────────────────────────────────────────────────────
    redis_url: str = Field(
        default="redis://localhost:6379/0",
        description="Redis connection URL",
    )

    # ── Object Storage (MinIO / S3) ───────────────────────────────────────
    s3_endpoint_url: str = "http://localhost:9000"
    s3_access_key: str = "minioadmin"
    s3_secret_key: str = "minioadmin"
    s3_bucket_artifacts: str = "guppy-artifacts"
    s3_region: str = "us-east-1"

    # ── API ──────────────────────────────────────────────────────────────
    api_prefix: str = "/api/v1"
    cors_origins: list[str] = ["http://localhost:3000"]

    # ── Execution ────────────────────────────────────────────────────────
    tool_execution_timeout_seconds: int = 300
    max_artifact_size_bytes: int = 100 * 1024 * 1024  # 100 MB

    # ── Auth / Session ────────────────────────────────────────────────────
    secret_key: str = Field(
        default="change-me-in-production-use-a-long-random-secret",
        description="Secret key for signing session tokens",
    )
    session_cookie_name: str = "guppy_session"
    session_ttl_seconds: int = 86400 * 30  # 30 days

    # ── Auth hardening ────────────────────────────────────────────────────
    auth_max_login_attempts: int = 5
    auth_lockout_window_seconds: int = 900  # 15 minutes
    auth_lockout_duration_seconds: int = 900  # 15 minutes
    password_min_length: int = 8

    # ── Admin Seed ────────────────────────────────────────────────────────
    admin_email: str = Field(default="admin@guppykit.com", description="Admin user email")
    admin_password: str = Field(default="changeme-admin-123", description="Admin user password")
    admin_create_on_startup: bool = True


def get_settings() -> Settings:
    """Return a cached settings instance."""
    return _settings


_settings = Settings()
