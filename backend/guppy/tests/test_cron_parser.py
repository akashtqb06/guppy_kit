import pytest

from guppy.tools.base import NoConfig
from guppy.tools.developer.cron_parser import CronParserInput, CronParserTool


@pytest.mark.asyncio
async def test_cron_parser():
    tool = CronParserTool()
    result = await tool.execute(CronParserInput(expression="* * * * *"), NoConfig())
    assert result.is_valid is True
