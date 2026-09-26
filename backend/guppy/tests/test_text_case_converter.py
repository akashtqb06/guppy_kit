import pytest
from guppy.tools.utilities.text_case_converter import TextCaseConverterTool, Input

@pytest.mark.asyncio
async def test_text_case_converter():
    tool = TextCaseConverterTool()
    out = await tool.execute(Input(text="hello world"), None)
    assert out.camel_case == "helloWorld"
    assert out.snake_case == "hello_world"
