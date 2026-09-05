"""HTML to PDF converter."""

from __future__ import annotations
import base64
import re
from io import BytesIO
from pydantic import BaseModel, Field
from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool


class Input(BaseModel):
    html_content: str = Field(description="HTML content to convert to PDF")
    title: str = Field(default="Document", description="PDF title")
    include_page_numbers: bool = Field(default=True)


class Output(BaseModel):
    pdf_base64: str
    page_count: int
    file_size_bytes: int


class HtmlToPdfTool(BaseTool):
    name = "html-to-pdf"
    version = "1.0.0"
    category = ToolCategory.DOCUMENTS
    icon = "file-code"
    description = "Convert HTML content to a downloadable PDF document."
    tags = ["html", "pdf", "convert", "document"]  # noqa: RUF012
    output_artifact_type = ArtifactType.PDF
    input_artifact_types = []  # noqa: RUF012
    input_schema = Input
    output_schema = Output
    config_schema = BaseModel

    async def execute(self, input: Input, config: BaseModel) -> Output:
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors

        buf = BytesIO()
        doc = SimpleDocTemplate(
            buf, pagesize=A4, leftMargin=72, rightMargin=72, topMargin=72, bottomMargin=72
        )
        styles = getSampleStyleSheet()
        story = []

        if input.title:
            story.append(Paragraph(input.title, styles["Title"]))
            story.append(Spacer(1, 12))

        # Strip HTML and add paragraphs
        clean_text = re.sub(r"<br\s*/?>", "\n", input.html_content)
        clean_text = re.sub(r"<[^>]+>", "", clean_text)
        for para in clean_text.split("\n\n"):
            para = para.strip()
            if para:
                story.append(Paragraph(para, styles["Normal"]))
                story.append(Spacer(1, 6))

        doc.build(story)
        pdf_bytes = buf.getvalue()
        return Output(
            pdf_base64=base64.b64encode(pdf_bytes).decode(),
            page_count=max(1, len(story) // 20),
            file_size_bytes=len(pdf_bytes),
        )
