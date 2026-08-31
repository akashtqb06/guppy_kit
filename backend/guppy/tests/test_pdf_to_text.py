import pytest
import base64
from io import BytesIO
import pypdf
from guppy.tools.documents.pdf_to_text import PdfToTextTool, Input

@pytest.mark.asyncio
async def test_pdf_to_text():
    writer = pypdf.PdfWriter()
    writer.add_blank_page(width=100, height=100)
    out = BytesIO()
    writer.write(out)
    b64 = base64.b64encode(out.getvalue()).decode("utf-8")
    
    tool = PdfToTextTool()
    inp = Input(pdf_base64=b64)
    res = await tool.execute(inp, None)
    
    assert res.page_count >= 1
    assert res.extracted_pages >= 1

