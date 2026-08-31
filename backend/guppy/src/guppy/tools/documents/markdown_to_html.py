from __future__ import annotations

import markdown
from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class MarkdownToHtmlInput(BaseModel):
    markdown_text: str
    include_styles: bool = True


class MarkdownToHtmlOutput(BaseModel):
    html: str
    word_count: int


class MarkdownToHtmlTool(BaseTool[MarkdownToHtmlInput, NoConfig, MarkdownToHtmlOutput]):
    name = "markdown-to-html"
    version = "1.0.0"
    category = ToolCategory.DOCUMENTS
    description = "A standard tool implementation."
    tags = ["documents", "utility"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.HTML
    icon = "📄"

    input_schema = MarkdownToHtmlInput
    output_schema = MarkdownToHtmlOutput
    config_schema = NoConfig

    async def execute(self, input: MarkdownToHtmlInput, config: NoConfig) -> MarkdownToHtmlOutput:
        html_content = markdown.markdown(input.markdown_text, extensions=["fenced_code", "tables"])
        if input.include_styles:
            html_content = f"""<div style="font-family: sans-serif; line-height: 1.6;">
<style>
  table {{ border-collapse: collapse; width: 100%; }}
  th, td {{ border: 1px solid #ddd; padding: 8px; }}
  pre {{ background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }}
  code {{ font-family: monospace; }}
</style>
{html_content}
</div>"""
        import re

        words = re.findall(r"\b\w+\b", input.markdown_text)
        return MarkdownToHtmlOutput(html=html_content, word_count=len(words))
