import pytest
from guppy.tools.utilities.string_utilities import StringUtilitiesTool, Input

@pytest.mark.asyncio
async def test_string_utilities():
    tool = StringUtilitiesTool()
    out = await tool.execute(Input(text="hello", operation="reverse"), None)
    assert out.result == "olleh"
