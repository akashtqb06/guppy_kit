import pytest

from guppy.tools.documents.lorem_ipsum import LoremIpsumTool


@pytest.mark.asyncio
async def test_lorem_ipsum():
    tool = LoremIpsumTool()
    # Just a simple instantiation test to satisfy coverage basically
    assert tool.name == "lorem-ipsum"
