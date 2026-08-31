import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from guppy.auth.dependencies import get_current_user
from guppy.auth.models import User
from guppy.core.db import get_db
from guppy.models.execution import Execution

router = APIRouter(prefix="/executions", tags=["executions"])


@router.get("", summary="List recent executions")
async def list_executions(
    tool_name: str | None = Query(default=None),
    status: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(Execution).order_by(desc(Execution.started_at)).limit(limit)
    if tool_name:
        stmt = stmt.where(Execution.tool_name == tool_name)
    if status:
        stmt = stmt.where(Execution.status == status)
    result = await db.scalars(stmt)
    rows = result.all()
    return [
        {
            "id": str(r.id),
            "tool_name": r.tool_name,
            "tool_version": r.tool_version,
            "status": r.status,
            "duration_ms": r.duration_ms,
            "artifact_id": str(r.artifact_id) if r.artifact_id else None,
            "started_at": r.started_at.isoformat(),
            "completed_at": r.completed_at.isoformat() if r.completed_at else None,
            "caller_type": r.caller_type,
        }
        for r in rows
    ]


@router.get("/{execution_id}", summary="Get execution details")
async def get_execution(
    execution_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        exec_uuid = uuid.UUID(execution_id)
    except ValueError:
        raise HTTPException(400, "Invalid execution ID") from None
    row = await db.get(Execution, exec_uuid)
    if not row:
        raise HTTPException(404, "Execution not found")
    return {
        "id": str(row.id),
        "tool_name": row.tool_name,
        "tool_version": row.tool_version,
        "status": row.status,
        "input_snapshot": row.input_snapshot,
        "duration_ms": row.duration_ms,
        "artifact_id": str(row.artifact_id) if row.artifact_id else None,
        "error": row.error,
        "started_at": row.started_at.isoformat(),
        "completed_at": row.completed_at.isoformat() if row.completed_at else None,
        "caller_type": row.caller_type,
    }
