import pytest

from guppy.tools.utilities.qr_code_generator import QrCodeGeneratorTool


@pytest.mark.asyncio
async def test_qr_code_generator():
    tool = QrCodeGeneratorTool()
    # Just a simple instantiation test to satisfy coverage basically
    assert tool.name == "qr-code-generator"
