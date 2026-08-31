import pytest
import base64
from io import BytesIO
import pypdf
from guppy.tools.documents.pdf_merger import PdfMergerTool, Input

@pytest.mark.asyncio
async def test_pdf_merger():
    writer = pypdf.PdfWriter()
    writer.add_blank_page(width=100, height=100)
    out = BytesIO()
    writer.write(out)
    b64 = base64.b64encode(out.getvalue()).decode("utf-8")
    
    tool = PdfMergerTool()
    inp = Input(pdfs_base64=[b64, b64], add_blank_page_between=True)
    res = await tool.execute(inp, None)
    
    assert res.files_merged == 2
    assert res.total_pages >= 2
    assert res.pdf_base64

