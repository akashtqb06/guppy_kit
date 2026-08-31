import base64
from io import BytesIO

import pypdf
from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool


class Input(BaseModel):
    pdfs_base64: list[str] = Field(
        description="List of base64-encoded PDF files to merge", min_length=2, max_length=20
    )
    add_blank_page_between: bool = Field(
        default=False, description="Add a blank separator page between merged PDFs"
    )


class Output(BaseModel):
    pdf_base64: str
    total_pages: int
    files_merged: int


class PdfMergerTool(BaseTool):
    name = "pdf-merger"
    version = "1.0.0"
    category = ToolCategory.DOCUMENTS
    icon = "📎"
    description = "Merge multiple PDF files into a single PDF."
    tags = ["pdf", "merge", "combine", "documents"]  # noqa: RUF012
    input_artifact_types = [ArtifactType.PDF]  # noqa: RUF012
    output_artifact_type = ArtifactType.PDF

    input_schema = Input
    output_schema = Output
    config_schema = BaseModel

    async def execute(self, input: Input, config: BaseModel) -> Output:
        writer = pypdf.PdfWriter()

        for idx, pdf_b64 in enumerate(input.pdfs_base64):
            pdf_bytes = base64.b64decode(pdf_b64)
            reader = pypdf.PdfReader(BytesIO(pdf_bytes))
            for page in reader.pages:
                writer.add_page(page)
            if input.add_blank_page_between and idx < len(input.pdfs_base64) - 1:
                writer.add_blank_page()

        out_stream = BytesIO()
        writer.write(out_stream)
        out_bytes = out_stream.getvalue()

        return Output(
            pdf_base64=base64.b64encode(out_bytes).decode("utf-8"),
            total_pages=len(writer.pages),
            files_merged=len(input.pdfs_base64),
        )
