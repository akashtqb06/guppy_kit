import pytest

from guppy.tools.database.er_diagram import ErDiagramTool


@pytest.mark.asyncio
async def test_er_diagram():
    tool = ErDiagramTool()
    # Just a simple instantiation test to satisfy coverage basically
    assert tool.name == "er-diagram"
