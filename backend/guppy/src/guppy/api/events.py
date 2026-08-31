import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from guppy.auth.dependencies import get_current_user
from guppy.auth.models import User
from guppy.core.db import get_db
from guppy.models.event import PlatformEvent

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", summary="List recent events")
async def list_events(
    event_type: str | None = Query(default=None),
    execution_id: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    stmt = select(PlatformEvent).order_by(desc(PlatformEvent.emitted_at)).limit(limit)
    if event_type:
        stmt = stmt.where(PlatformEvent.type == event_type)
    if execution_id:
        try:
            exec_uuid = uuid.UUID(execution_id)
            stmt = stmt.where(PlatformEvent.execution_id == exec_uuid)
        except ValueError:
            raise HTTPException(400, "Invalid execution ID") from None

    result = await db.scalars(stmt)
    rows = result.all()

    return [
        {
            "id": str(r.id),
            "type": r.type,
            "payload": r.payload,
            "project_id": str(r.project_id) if r.project_id else None,
            "execution_id": str(r.execution_id) if r.execution_id else None,
            "artifact_id": str(r.artifact_id) if r.artifact_id else None,
            "emitted_at": r.emitted_at.isoformat(),
        }
        for r in rows
    ]
