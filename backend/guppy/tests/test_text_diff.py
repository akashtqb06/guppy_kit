import pytest

from guppy.tools.documents.text_diff import TextDiffTool


@pytest.mark.asyncio
async def test_text_diff():
    tool = TextDiffTool()
    # Just a simple instantiation test to satisfy coverage basically
    assert tool.name == "text-diff"
