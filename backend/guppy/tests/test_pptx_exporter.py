import pytest
import base64
from guppy.tools.presentation.pptx_exporter import PptxExporterTool, Input, SlideInput

@pytest.mark.asyncio
async def test_pptx_exporter():
    tool = PptxExporterTool()
    slides = [SlideInput(title="Slide 1", content="Bullet 1\nBullet 2")]
    inp = Input(title="My Pres", slides=slides, theme="default")
    res = await tool.execute(inp, None)
    
    assert res.slide_count == 2  # title slide + 1 content
    assert res.pptx_base64
    out_bytes = base64.b64decode(res.pptx_base64)
    assert out_bytes.startswith(b'PK')

