import uuid
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from guppy.core.types import ARTIFACT_MIME_TYPES, ArtifactType
from guppy.models.artifact import Artifact

LOCAL_ARTIFACT_DIR = Path("/tmp/guppy_artifacts")


class ArtifactService:
    def __init__(self) -> None:
        LOCAL_ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

    async def store(
        self,
        *,
        db: AsyncSession,
        execution_id: uuid.UUID,
        tool_name: str,
        tool_version: str,
        artifact_type: ArtifactType,
        content: bytes,
        project_id: uuid.UUID | None = None,
        output_schema: dict,
        metadata: dict | None = None,
    ) -> Artifact:
        # Write file locally
        ext = artifact_type.value  # e.g. "json", "svg"
        filename = f"output.{ext}"
        storage_ref = f"{execution_id}/{filename}"
        artifact_path = LOCAL_ARTIFACT_DIR / str(execution_id)
        artifact_path.mkdir(parents=True, exist_ok=True)
        (artifact_path / filename).write_bytes(content)

        # Create DB row
        artifact = Artifact(
            execution_id=execution_id,
            project_id=project_id,
            tool_name=tool_name,
            tool_version=tool_version,
            artifact_type=artifact_type.value,
            storage_ref=storage_ref,
            filename=filename,
            size_bytes=len(content),
            mime_type=ARTIFACT_MIME_TYPES.get(artifact_type, "application/octet-stream"),
            output_schema=output_schema,
            metadata_=metadata,
        )
        db.add(artifact)
        await db.flush()
        await db.refresh(artifact)
        return artifact

    async def get_content(self, artifact: Artifact) -> bytes:
        path = LOCAL_ARTIFACT_DIR / artifact.storage_ref
        return path.read_bytes()


# Singleton
artifact_service = ArtifactService()
