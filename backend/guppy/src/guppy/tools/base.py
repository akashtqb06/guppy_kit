"""
BaseTool — the contract every tool must implement.

A tool is a stateless, typed, async callable:
  execute(input: InputT, config: ConfigT) -> OutputT

The three generic parameters map to Pydantic models that define:
  - InputT : required data fed by the user / upstream artifact
  - ConfigT: optional behaviour knobs (e.g. delimiter, indent)
  - OutputT: the result; must include at least one artifact field

Tools are discovered via YAML definitions in tool-definitions/ and
registered in the ToolRegistry at startup.  The ToolRuntime then
orchestrates validation → execution → artifact persistence → event emission.
"""

from __future__ import annotations

import abc
from typing import Generic, TypeVar

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory

InputT = TypeVar("InputT", bound=BaseModel)
ConfigT = TypeVar("ConfigT", bound=BaseModel)
OutputT = TypeVar("OutputT", bound=BaseModel)


class ToolMetadata(BaseModel):
    """Static metadata declared by every tool."""

    icon: str = "🛠️"

    name: str
    version: str
    category: ToolCategory
    description: str
    tags: list[str] = []
    # Artifact types this tool can consume as inputs
    input_artifact_types: list[ArtifactType] = []
    # Artifact type this tool produces
    output_artifact_type: ArtifactType


class BaseTool(abc.ABC, Generic[InputT, ConfigT, OutputT]):
    """Abstract base class that every Guppy tool must extend."""

    # ── Identity — must be set as class-level attributes ──────────────────
    icon: str = "🛠️"
    name: str
    version: str
    category: ToolCategory
    description: str
    tags: list[str] = []  # noqa: RUF012
    input_artifact_types: list[ArtifactType] = []  # noqa: RUF012
    output_artifact_type: ArtifactType

    # ── Schemas — must be set as class-level attributes ───────────────────
    input_schema: type[InputT]
    output_schema: type[OutputT]
    config_schema: type[ConfigT]

    # ── Implementation ────────────────────────────────────────────────────

    @abc.abstractmethod
    async def execute(self, input: InputT, config: ConfigT) -> OutputT:
        """
        Run the tool.

        Raises:
            ToolInputError: if the input is semantically invalid after schema validation.
            ToolExecutionError: if an unexpected runtime error occurs.
        """
        ...

    # ── Helpers ───────────────────────────────────────────────────────────

    @classmethod
    def metadata(cls) -> ToolMetadata:
        """Return a serialisable metadata snapshot."""
        return ToolMetadata(
            name=cls.name,
            icon=cls.icon,
            version=cls.version,
            category=cls.category,
            description=cls.description,
            tags=cls.tags,
            input_artifact_types=cls.input_artifact_types,
            output_artifact_type=cls.output_artifact_type,
        )

    def __repr__(self) -> str:
        return f"<Tool {self.name}@{self.version}>"


class NoConfig(BaseModel):
    """Sentinel config model for tools that have no configuration knobs."""

    pass
