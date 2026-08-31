import pytest
import base64
from io import BytesIO
from docx import Document
from guppy.tools.documents.docx_to_text import DocxToTextTool, Input

@pytest.mark.asyncio
async def test_docx_to_text():
    doc = Document()
    doc.add_paragraph("Hello World")
    out = BytesIO()
    doc.save(out)
    b64 = base64.b64encode(out.getvalue()).decode("utf-8")
    
    tool = DocxToTextTool()
    inp = Input(docx_base64=b64)
    res = await tool.execute(inp, None)
    
    assert res.word_count >= 1
    assert "Hello World" in res.text

