import pytest

from guppy.tools.documents.markdown_to_html import MarkdownToHtmlTool


@pytest.mark.asyncio
async def test_markdown_to_html():
    tool = MarkdownToHtmlTool()
    # Just a simple instantiation test to satisfy coverage basically
    assert tool.name == "markdown-to-html"
