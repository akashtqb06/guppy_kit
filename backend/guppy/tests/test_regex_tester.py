import pytest

from guppy.tools.base import NoConfig
from guppy.tools.developer.regex_tester import RegexTesterInput, RegexTesterTool


@pytest.mark.asyncio
async def test_regex_tester():
    tool = RegexTesterTool()
    result = await tool.execute(RegexTesterInput(pattern="a", text="a"), NoConfig())
    assert result.match_count == 1
