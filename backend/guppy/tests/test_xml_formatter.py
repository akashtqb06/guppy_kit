import pytest
from guppy.tools.developer.xml_formatter import XmlFormatterTool, Input

@pytest.mark.asyncio
async def test_xml_formatter():
    tool = XmlFormatterTool()
    out = await tool.execute(Input(xml_content="<root><child/></root>"), None)
    assert out.is_valid
    assert out.root_element == "root"
    assert out.element_count == 2
