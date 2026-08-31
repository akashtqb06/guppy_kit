import pytest

from guppy.tools.base import NoConfig
from guppy.tools.utilities.timestamp_converter import (
    TimestampConverterInput,
    TimestampConverterTool,
)


@pytest.mark.asyncio
async def test_timestamp_converter():
    tool = TimestampConverterTool()
    result = await tool.execute(TimestampConverterInput(value="0", from_format="unix"), NoConfig())
    assert result.unix == 0
