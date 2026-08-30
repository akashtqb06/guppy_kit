"""
Tools API router.

Endpoints:
  GET  /api/v1/tools/categories          → all category metadata
  GET  /api/v1/tools[?category=...]      → registered tools (optional filter)
  GET  /api/v1/tools/{name}             → single tool metadata + input schema
  POST /api/v1/tools/{name}/execute      → execute a tool
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from guppy.core.db import get_db
from guppy.core.types import CATEGORY_METADATA, ArtifactType, CategoryMeta, ToolCategory
from guppy.tools.registry import registry
from guppy.tools.runtime import ToolRuntime

router = APIRouter(prefix="/tools", tags=["tools"])
_runtime = ToolRuntime(registry)


# ── Request / Response schemas ─────────────────────────────────────────────────


class ExecuteRequest(BaseModel):
    input: dict  # type: ignore[type-arg]
    config: dict | None = None  # type: ignore[type-arg]
    project_id: str | None = None


class ExecuteResponse(BaseModel):
    execution_id: str
    tool_name: str
    status: str
    output: dict  # type: ignore[type-arg]
    artifact_id: str | None
    duration_ms: float


class CategorySummary(BaseModel):
    id: str
    name: str
    icon: str
    description: str
    tool_count: int


class ToolSummary(BaseModel):
    name: str
    version: str
    category: ToolCategory
    description: str
    tags: list[str]
    input_artifact_types: list[ArtifactType]
    output_artifact_type: ArtifactType


class ToolDetail(ToolSummary):
    """Extended tool metadata including the JSON Schema of inputs."""

    input_schema: dict[str, Any]


# ── Helpers ────────────────────────────────────────────────────────────────────


def _category_summary(meta: CategoryMeta, tool_count: int) -> CategorySummary:
    return CategorySummary(
        id=meta.id,
        name=meta.name,
        icon=meta.icon,
        description=meta.description,
        tool_count=tool_count,
    )


def _tools_by_category() -> dict[ToolCategory, int]:
    counts: dict[ToolCategory, int] = dict.fromkeys(ToolCategory, 0)
    for tool in registry.list_all():
        counts[tool.category] = counts.get(tool.category, 0) + 1
    return counts


# ── Endpoints ──────────────────────────────────────────────────────────────────


@router.get(
    "/categories",
    response_model=list[CategorySummary],
    summary="List all tool categories with metadata",
)
async def list_categories() -> list[CategorySummary]:
    """
    Return every tool category with its display metadata (name, icon, description)
    and the count of currently registered tools in each category.

    The order matches the ToolCategory enum definition.
    """
    counts = _tools_by_category()
    return [
        _category_summary(meta, counts.get(cat, 0))
        for cat, meta in CATEGORY_METADATA.items()
    ]


@router.get(
    "",
    response_model=list[ToolSummary],
    summary="List registered tools",
)
async def list_tools(
    category: ToolCategory | None = Query(
        default=None,
        description="Filter by tool category (e.g. developer, data, utilities)",
    ),
) -> list[ToolSummary]:
    """
    Return all registered tools, optionally filtered by category.

    Use `?category=developer` to list only developer tools.
    """
    tools = registry.list_all()
    if category is not None:
        tools = [t for t in tools if t.category == category]
    return [ToolSummary(**tool.metadata().model_dump()) for tool in tools]


@router.get(
    "/{name}",
    response_model=ToolDetail,
    summary="Get tool metadata and input schema",
)
async def get_tool(name: str) -> ToolDetail:
    """
    Return metadata for a single tool by name, including the full JSON Schema
    of its input model (so the UI can auto-render input fields).
    """
    tool = registry.get(name)  # raises ToolNotFoundError → 404
    meta = tool.metadata().model_dump()
    input_schema: dict[str, Any] = {}
    if hasattr(tool, "input_schema") and hasattr(tool.input_schema, "model_json_schema"):
        input_schema = tool.input_schema.model_json_schema()
    return ToolDetail(**meta, input_schema=input_schema)


@router.post(
    "/{name}/execute",
    response_model=ExecuteResponse,
    summary="Execute a tool",
    status_code=200,
)
async def execute_tool(
    name: str,
    body: ExecuteRequest,
    session: AsyncSession = Depends(get_db),
) -> ExecuteResponse:
    """
    Execute a registered tool.

    The runtime validates input and config against the tool's Pydantic schemas,
    runs `tool.execute()`, and returns the structured output.
    """
    result = await _runtime.execute(
        tool_name=name,
        raw_input=body.input,
        raw_config=body.config,
        session=session,
        project_id=body.project_id,
    )
    return ExecuteResponse(
        execution_id=result.execution_id,
        tool_name=result.tool_name,
        status=result.status.value,
        output=result.output.model_dump() if hasattr(result.output, "model_dump") else {},
        artifact_id=result.artifact_id,
        duration_ms=round(result.duration_ms, 2),
    )
