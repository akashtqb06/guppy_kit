import pytest

from guppy.tools.base import NoConfig
from guppy.tools.developer.uuid_generator import UuidGeneratorInput, UuidGeneratorTool


@pytest.mark.asyncio
async def test_uuid_generator():
    tool = UuidGeneratorTool()
    result = await tool.execute(UuidGeneratorInput(version=4, count=1), NoConfig())
    assert len(result.uuids) == 1
