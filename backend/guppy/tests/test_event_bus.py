import uuid
from unittest.mock import AsyncMock

import pytest

from guppy.events.bus import event_bus


@pytest.mark.asyncio
async def test_event_bus_emit():
    mock_db = AsyncMock()

    execution_id = uuid.uuid4()

    event = await event_bus.emit(
        db=mock_db,
        event_type="test.event",
        payload={"key": "value"},
        execution_id=execution_id,
    )

    assert mock_db.add.called
    assert event.type == "test.event"
    assert event.payload == {"key": "value"}
    assert event.execution_id == execution_id
