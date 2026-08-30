"""Tools API router — POST /api/v1/tools/{name}/execute and GET /api/v1/tools."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from guppy.core.db import get_db
from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.registry import registry
from guppy.tools.runtime import ToolRuntime

router = APIRouter(prefix="/tools", tags=["tools"])
_runtime = ToolRuntime(registry)


# ── Request / Response schemas ────────────────────────────────────────────────


class ExecuteRequest(BaseModel):
    input: dict
    config: dict | None = None
    project_id: str | None = None


class ExecuteResponse(BaseModel):
    execution_id: str
    tool_name: str
    status: str
    output: dict
    artifact_id: str | None
    duration_ms: float


class ToolSummary(BaseModel):
    name: str
    version: str
    category: ToolCategory
    description: str
    tags: list[str]
    input_artifact_types: list[ArtifactType]
    output_artifact_type: ArtifactType


# ── Endpoints ─────────────────────────────────────────────────────────────────


@router.get("", response_model=list[ToolSummary], summary="List all registered tools")
async def list_tools() -> list[ToolSummary]:
    """Return metadata for every tool in the registry."""
    return [
        ToolSummary(**tool.metadata().model_dump()) for tool in registry.list_all()
    ]


@router.get("/{name}", response_model=ToolSummary, summary="Get tool metadata")
async def get_tool(name: str) -> ToolSummary:
    """Return metadata for a single tool by name."""
    tool = registry.get(name)  # raises ToolNotFoundError → 404
    return ToolSummary(**tool.metadata().model_dump())


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
