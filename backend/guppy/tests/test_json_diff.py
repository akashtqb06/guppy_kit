import pytest

from guppy.tools.base import NoConfig
from guppy.tools.data.json_diff import JsonDiffInput, JsonDiffTool


@pytest.mark.asyncio
async def test_json_diff():
    tool = JsonDiffTool()
    result = await tool.execute(JsonDiffInput(json_a='{"a":1}', json_b='{"a":1}'), NoConfig())
    assert result.is_identical is True
