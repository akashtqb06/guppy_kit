import base64
from io import BytesIO

import pypdf
from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool


class Input(BaseModel):
    pdf_base64: str = Field(description="Base64-encoded PDF file content")
    include_page_numbers: bool = Field(
        default=True, description="Prefix each page's text with 'Page N:'"
    )
    max_pages: int = Field(default=0, ge=0, description="Max pages to extract (0 = all)")


class Output(BaseModel):
    text: str
    page_count: int
    extracted_pages: int
    char_count: int
    word_count: int


class PdfToTextTool(BaseTool):
    name = "pdf-to-text"
    version = "1.0.0"
    category = ToolCategory.DOCUMENTS
    icon = "📄"
    description = "Extract text content from a PDF file (uploaded as base64)."
    tags = ["pdf", "text", "extract", "documents"]  # noqa: RUF012
    input_artifact_types = [ArtifactType.PDF]  # noqa: RUF012
    output_artifact_type = ArtifactType.TEXT

    input_schema = Input
    output_schema = Output
    config_schema = BaseModel

    async def execute(self, input: Input, config: BaseModel) -> Output:
        pdf_bytes = base64.b64decode(input.pdf_base64)
        reader = pypdf.PdfReader(BytesIO(pdf_bytes))

        page_count = len(reader.pages)
        max_p = input.max_pages if input.max_pages > 0 else page_count
        extracted_pages = min(max_p, page_count)

        extracted_text = []
        for i in range(extracted_pages):
            page_text = reader.pages[i].extract_text()
            if input.include_page_numbers:
                extracted_text.append(f"--- Page {i + 1} ---\n{page_text}")
            else:
                extracted_text.append(page_text)

        full_text = "\n".join(extracted_text)

        return Output(
            text=full_text,
            page_count=page_count,
            extracted_pages=extracted_pages,
            char_count=len(full_text),
            word_count=len(full_text.split()),
        )
