import pytest
from guppy.tools.developer.number_base_converter import NumberBaseConverterTool, Input

@pytest.mark.asyncio
async def test_number_base_converter():
    tool = NumberBaseConverterTool()
    out = await tool.execute(Input(value="255", from_base="10"), None)
    assert out.is_valid
    assert out.hexadecimal == "0xff"
