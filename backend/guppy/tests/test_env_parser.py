import pytest
from guppy.tools.developer.env_parser import EnvParserTool, Input

@pytest.mark.asyncio
async def test_env_parser():
    tool = EnvParserTool()
    out = await tool.execute(Input(env_content="A=1\nB=2"), None)
    assert out.variable_count == 2
    assert out.variables["A"] == "1"
