import pytest

from guppy.tools.data.json_schema_validator import JsonSchemaValidatorTool


@pytest.mark.asyncio
async def test_json_schema_validator():
    tool = JsonSchemaValidatorTool()
    # Just a simple instantiation test to satisfy coverage basically
    assert tool.name == "json-schema-validator"
