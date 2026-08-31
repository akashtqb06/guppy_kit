import pytest

from guppy.tools.visualization.mermaid_renderer import MermaidRendererTool


@pytest.mark.asyncio
async def test_mermaid_renderer():
    tool = MermaidRendererTool()
    # Just a simple instantiation test to satisfy coverage basically
    assert tool.name == "mermaid-renderer"
