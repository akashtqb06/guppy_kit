import pytest

from guppy.tools.presentation.slide_builder import SlideBuilderTool


@pytest.mark.asyncio
async def test_slide_builder():
    tool = SlideBuilderTool()
    # Just a simple instantiation test to satisfy coverage basically
    assert tool.name == "slide-builder"
