import pytest

from guppy.tools.base import NoConfig
from guppy.tools.developer.json_formatter import JsonFormatterInput, JsonFormatterTool


@pytest.mark.asyncio
async def test_json_formatter():
    tool = JsonFormatterTool()
    result = await tool.execute(JsonFormatterInput(json_string='{"a":1}'), NoConfig())
    assert result.valid is True
