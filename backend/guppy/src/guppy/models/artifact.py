"""Artifact ORM model — typed, immutable output of a tool execution."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from guppy.core.db import Base


class Artifact(Base):
    """
    Immutable typed output of a tool execution.

    Artifacts are written once and never updated. They are the composition
    glue — they can be passed as input to downstream tools.
    """

    __tablename__ = "artifacts"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    execution_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("executions.id", ondelete="CASCADE"),
        nullable=False,
    )
    project_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    tool_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    tool_version: Mapped[str] = mapped_column(String(50), nullable=False)
    # json | csv | xlsx | pdf | svg | png | sql | markdown | text | diagram | ...
    artifact_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    # S3 key: artifacts/{project_id}/{execution_id}/output.{ext}
    storage_ref: Mapped[str] = mapped_column(Text, nullable=False)
    filename: Mapped[str] = mapped_column(String(512), nullable=False)
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(255), nullable=False)
    # Snapshot of the tool's output_schema at execution time
    output_schema: Mapped[dict] = mapped_column(JSONB, nullable=False)
    # Tool-specific metadata (e.g. row_count for CSV artifacts)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
