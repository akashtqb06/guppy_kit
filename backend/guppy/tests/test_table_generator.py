import pytest
from guppy.tools.data.table_generator import TableGeneratorTool, Input

@pytest.mark.asyncio
async def test_table_generator():
    tool = TableGeneratorTool()
    out = await tool.execute(Input(json_data='[{"a":1},{"a":2}]', output_format="both"), None)
    assert out.is_valid
    assert out.row_count == 2
    assert "markdown" in out.model_dump()
