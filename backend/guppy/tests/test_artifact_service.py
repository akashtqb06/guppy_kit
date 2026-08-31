import uuid
from unittest.mock import AsyncMock

import pytest

from guppy.artifacts.service import artifact_service
from guppy.core.types import ArtifactType


@pytest.mark.asyncio
async def test_artifact_store_and_get():
    # Setup mock db
    mock_db = AsyncMock()

    execution_id = uuid.uuid4()
    content = b'{"test": "data"}'

    artifact = await artifact_service.store(
        db=mock_db,
        execution_id=execution_id,
        tool_name="test_tool",
        tool_version="1.0.0",
        artifact_type=ArtifactType.JSON,
        content=content,
        output_schema={"type": "object"},
    )

    assert mock_db.add.called
    assert artifact.execution_id == execution_id

    # Test reading it back
    read_content = await artifact_service.get_content(artifact)
    assert read_content == content
