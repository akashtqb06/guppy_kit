"""PDF Generator — converts Markdown/HTML to a styled PDF with layout templates."""

from __future__ import annotations

import base64
from typing import Literal

from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool


class PdfTemplate(BaseModel):
    """PDF layout and styling configuration."""

    paper_size: Literal["A4", "A3", "Letter", "Legal"] = Field(
        default="A4", description="Paper size"
    )
    orientation: Literal["portrait", "landscape"] = Field(
        default="portrait", description="Page orientation"
    )
    font_family: Literal["helvetica", "times", "courier"] = Field(
        default="helvetica", description="Font family"
    )
    font_size: int = Field(default=11, ge=8, le=24, description="Base font size in pt")
    margin_mm: int = Field(default=20, ge=5, le=50, description="Page margin in mm")
    theme: Literal["default", "minimal", "professional", "dark"] = Field(
        default="default", description="Color theme"
    )
    header_text: str = Field(default="", description="Optional header text on each page")
    footer_text: str = Field(default="", description="Optional footer text on each page")
    include_page_numbers: bool = Field(default=True, description="Show page numbers in footer")
    line_height: float = Field(default=1.5, ge=1.0, le=3.0, description="Line height multiplier")


class PdfGeneratorInput(BaseModel):
    content: str = Field(description="Markdown or HTML content to convert to PDF")
    title: str = Field(default="Document", description="Document title")
    content_type: Literal["markdown", "html", "plain"] = Field(
        default="markdown", description="Input content type"
    )
    template: PdfTemplate = Field(default_factory=PdfTemplate, description="PDF layout template")


class PdfGeneratorOutput(BaseModel):
    pdf_base64: str = Field(description="Base64-encoded PDF")
    page_count: int = Field(description="Number of pages generated")
    file_size_bytes: int = Field(description="PDF file size in bytes")
    title: str
    template_used: dict


class PdfGeneratorTool(BaseTool):
    name = "pdf-generator"
    version = "1.0.0"
    category = ToolCategory.DOCUMENTS
    icon = "file-pdf"
    description = (
        "Convert Markdown or HTML content to a styled PDF with configurable layout templates."
    )
    tags = ["pdf", "document", "markdown", "html", "export", "template"]  # noqa: RUF012
    output_artifact_type = ArtifactType.PDF
    input_artifact_types = []  # noqa: RUF012

    input_schema = PdfGeneratorInput
    output_schema = PdfGeneratorOutput
    config_schema = BaseModel

    async def execute(self, input: PdfGeneratorInput, config: BaseModel) -> PdfGeneratorOutput:
        # Convert content to HTML first
        html_content = self._prepare_html(input)

        # Generate PDF using reportlab (pure Python, no system deps)
        pdf_bytes = self._generate_pdf_reportlab(input, html_content)

        pdf_b64 = base64.b64encode(pdf_bytes).decode()
        return PdfGeneratorOutput(
            pdf_base64=pdf_b64,
            page_count=self._estimate_pages(input.content),
            file_size_bytes=len(pdf_bytes),
            title=input.title,
            template_used=input.template.model_dump(),
        )

    def _prepare_html(self, input: PdfGeneratorInput) -> str:
        content = input.content
        if input.content_type == "markdown":
            import re

            # Basic Markdown to HTML conversion
            # Headers
            for i in range(6, 0, -1):
                content = re.sub(
                    r"^" + "#" * i + r"\s+(.+)$", rf"<h{i}>\1</h{i}>", content, flags=re.MULTILINE
                )
            # Bold
            content = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", content)
            # Italic
            content = re.sub(r"\*(.+?)\*", r"<em>\1</em>", content)
            # Inline code
            content = re.sub(r"`(.+?)`", r"<code>\1</code>", content)
            # Paragraphs
            paragraphs = content.split("\n\n")
            content = "\n".join(
                p if p.strip().startswith("<") else f"<p>{p.strip()}</p>"
                for p in paragraphs
                if p.strip()
            )
        elif input.content_type == "plain":
            content = f"<pre>{content}</pre>"
        return content

    def _get_theme_colors(self, theme: str) -> dict:
        themes = {
            "default": {
                "bg": (1, 1, 1),
                "text": (0.1, 0.1, 0.1),
                "accent": (0.2, 0.4, 0.8),
                "heading": (0.05, 0.05, 0.05),
            },
            "minimal": {
                "bg": (1, 1, 1),
                "text": (0.2, 0.2, 0.2),
                "accent": (0.5, 0.5, 0.5),
                "heading": (0, 0, 0),
            },
            "professional": {
                "bg": (0.98, 0.98, 0.98),
                "text": (0.1, 0.1, 0.2),
                "accent": (0.1, 0.3, 0.6),
                "heading": (0.05, 0.15, 0.4),
            },
            "dark": {
                "bg": (0.1, 0.1, 0.15),
                "text": (0.9, 0.9, 0.9),
                "accent": (0.4, 0.6, 1.0),
                "heading": (1, 1, 1),
            },
        }
        return themes.get(theme, themes["default"])

    def _generate_pdf_reportlab(self, input: PdfGeneratorInput, html_content: str) -> bytes:
        import re
        from io import BytesIO

        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A3, A4, LEGAL, LETTER
        from reportlab.lib.pagesizes import landscape as rl_landscape
        from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
        from reportlab.lib.units import mm
        from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer

        t = input.template
        theme = self._get_theme_colors(t.theme)

        # Page size
        page_map = {"A4": A4, "A3": A3, "Letter": LETTER, "Legal": LEGAL}
        pagesize = page_map.get(t.paper_size, A4)
        if t.orientation == "landscape":
            pagesize = rl_landscape(pagesize)

        # Font map
        font_map = {"helvetica": "Helvetica", "times": "Times-Roman", "courier": "Courier"}
        font = font_map.get(t.font_family, "Helvetica")
        font_bold = font + "-Bold"

        margin = t.margin_mm * mm
        buf = BytesIO()

        # Header/footer canvas
        def on_page(canvas, doc):
            canvas.saveState()
            w, h = pagesize
            if t.header_text:
                canvas.setFont(font, 8)
                canvas.setFillColorRGB(*theme["text"])
                canvas.drawString(margin, h - margin * 0.6, t.header_text)
                canvas.line(margin, h - margin * 0.7, w - margin, h - margin * 0.7)
            footer_parts = []
            if t.footer_text:
                footer_parts.append(t.footer_text)
            if t.include_page_numbers:
                footer_parts.append(f"Page {doc.page}")
            if footer_parts:
                canvas.setFont(font, 8)
                canvas.setFillColorRGB(*theme["text"])
                canvas.drawString(margin, margin * 0.5, "  ·  ".join(footer_parts))
            canvas.restoreState()

        top_margin = margin * (1.5 if t.header_text else 1)
        doc = SimpleDocTemplate(
            buf,
            pagesize=pagesize,
            leftMargin=margin,
            rightMargin=margin,
            topMargin=top_margin,
            bottomMargin=margin * 1.2,
        )

        base_style = ParagraphStyle(
            "base",
            fontName=font,
            fontSize=t.font_size,
            leading=t.font_size * t.line_height,
            textColor=colors.Color(*theme["text"]),
        )
        h1_style = ParagraphStyle(
            "h1",
            fontName=font_bold,
            fontSize=t.font_size + 8,
            leading=(t.font_size + 8) * 1.3,
            spaceAfter=8,
            textColor=colors.Color(*theme["heading"]),
        )
        h2_style = ParagraphStyle(
            "h2",
            fontName=font_bold,
            fontSize=t.font_size + 4,
            leading=(t.font_size + 4) * 1.3,
            spaceAfter=6,
            textColor=colors.Color(*theme["heading"]),
        )
        h3_style = ParagraphStyle(
            "h3",
            fontName=font_bold,
            fontSize=t.font_size + 2,
            leading=(t.font_size + 2) * 1.2,
            spaceAfter=4,
            textColor=colors.Color(*theme["heading"]),
        )
        code_style = ParagraphStyle(
            "code",
            fontName="Courier",
            fontSize=t.font_size - 1,
            leading=(t.font_size - 1) * 1.4,
            backColor=colors.Color(0.95, 0.95, 0.95),
        )

        story = []
        # Title
        if input.title:
            story.append(Paragraph(input.title, h1_style))
            story.append(
                HRFlowable(width="100%", thickness=1, color=colors.Color(*theme["accent"]))
            )
            story.append(Spacer(1, 12))

        # Simple line-by-line parsing
        for line in html_content.split("\n"):
            line = line.strip()
            if not line:
                story.append(Spacer(1, 4))
                continue
            if line.startswith("<h1>"):
                text = re.sub(r"<[^>]+>", "", line)
                story.append(Paragraph(text, h1_style))
            elif line.startswith("<h2>"):
                text = re.sub(r"<[^>]+>", "", line)
                story.append(Paragraph(text, h2_style))
            elif (
                line.startswith("<h3>")
                or line.startswith("<h4>")
                or line.startswith("<h5>")
                or line.startswith("<h6>")
            ):
                text = re.sub(r"<[^>]+>", "", line)
                story.append(Paragraph(text, h3_style))
            elif "<hr" in line:
                story.append(
                    HRFlowable(width="100%", thickness=0.5, color=colors.Color(0.7, 0.7, 0.7))
                )
            elif line.startswith("<pre>") or line.startswith("<code>"):
                text = re.sub(r"<[^>]+>", "", line)
                story.append(Paragraph(text, code_style))
            else:
                text = re.sub(r"<[^>]+>", "", line)
                if text:
                    story.append(Paragraph(text, base_style))
                    story.append(Spacer(1, 2))

        doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
        return buf.getvalue()

    def _estimate_pages(self, content: str) -> int:
        lines = len(content.split("\n"))
        return max(1, lines // 40)
