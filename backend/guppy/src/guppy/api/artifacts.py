import uuid

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession

from guppy.artifacts.service import artifact_service
from guppy.auth.dependencies import get_current_user
from guppy.auth.models import User
from guppy.core.db import get_db
from guppy.models.artifact import Artifact

router = APIRouter(prefix="/artifacts", tags=["artifacts"])


@router.get("/{artifact_id}", summary="Get artifact metadata")
async def get_artifact_meta(
    artifact_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        art_uuid = uuid.UUID(artifact_id)
    except ValueError:
        raise HTTPException(400, "Invalid artifact ID") from None
    row = await db.get(Artifact, art_uuid)
    if not row:
        raise HTTPException(404, "Artifact not found")
    return {
        "id": str(row.id),
        "execution_id": str(row.execution_id),
        "tool_name": row.tool_name,
        "artifact_type": row.artifact_type,
        "filename": row.filename,
        "size_bytes": row.size_bytes,
        "mime_type": row.mime_type,
        "created_at": row.created_at.isoformat(),
    }


@router.get("/{artifact_id}/download", summary="Download artifact content")
async def download_artifact(
    artifact_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        art_uuid = uuid.UUID(artifact_id)
    except ValueError:
        raise HTTPException(400, "Invalid artifact ID") from None
    row = await db.get(Artifact, art_uuid)
    if not row:
        raise HTTPException(404, "Artifact not found")
    content = await artifact_service.get_content(row)
    return Response(
        content=content,
        media_type=row.mime_type,
        headers={"Content-Disposition": f'attachment; filename="{row.filename}"'},
    )
