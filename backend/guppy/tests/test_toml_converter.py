import pytest
from guppy.tools.data.toml_converter import TomlConverterTool, Input

@pytest.mark.asyncio
async def test_toml_converter():
    tool = TomlConverterTool()
    out = await tool.execute(Input(content='{"a": 1}', direction="json_to_toml"), None)
    assert out.is_valid
    assert "a = 1" in out.result
