"""Execution ORM model — records every tool invocation."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from guppy.core.db import Base


class Execution(Base):
    """Immutable audit record of a single tool invocation."""

    __tablename__ = "executions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    tool_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    tool_version: Mapped[str] = mapped_column(String(50), nullable=False)
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    # running | completed | failed
    status: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    # Snapshot of input at execution time — immutable after creation
    input_snapshot: Mapped[dict] = mapped_column(JSONB, nullable=False)
    config_snapshot: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    # FK set on completion
    artifact_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
        index=True,
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    duration_ms: Mapped[float | None] = mapped_column(Float, nullable=True)
    # ui | rest | mcp
    caller_type: Mapped[str] = mapped_column(String(50), nullable=False, default="ui")
