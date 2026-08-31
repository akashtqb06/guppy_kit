import pytest

from guppy.tools.base import NoConfig
from guppy.tools.data.json_to_csv import JsonToCsvInput, JsonToCsvTool


@pytest.mark.asyncio
async def test_json_to_csv():
    tool = JsonToCsvTool()
    result = await tool.execute(JsonToCsvInput(json_content='[{"a":1}]', delimiter=","), NoConfig())
    assert result.row_count == 1
