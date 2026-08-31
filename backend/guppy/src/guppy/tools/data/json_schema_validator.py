from __future__ import annotations

import json

import jsonschema
from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class JsonSchemaValidatorInput(BaseModel):
    json_data: str
    json_schema: str


class JsonSchemaValidatorOutput(BaseModel):
    is_valid: bool
    errors: list[str]
    error_count: int


class JsonSchemaValidatorTool(
    BaseTool[JsonSchemaValidatorInput, NoConfig, JsonSchemaValidatorOutput]
):
    name = "json-schema-validator"
    version = "1.0.0"
    category = ToolCategory.DATA
    description = "A standard tool implementation."
    tags = ["data", "utility"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON
    icon = "🔍"

    input_schema = JsonSchemaValidatorInput
    output_schema = JsonSchemaValidatorOutput
    config_schema = NoConfig

    async def execute(
        self, input: JsonSchemaValidatorInput, config: NoConfig
    ) -> JsonSchemaValidatorOutput:
        try:
            data = json.loads(input.json_data)
            schema = json.loads(input.json_schema)
            validator = jsonschema.Draft7Validator(schema)
            errors = [err.message for err in validator.iter_errors(data)]
            return JsonSchemaValidatorOutput(
                is_valid=len(errors) == 0, errors=errors, error_count=len(errors)
            )
        except Exception as e:
            return JsonSchemaValidatorOutput(is_valid=False, errors=[str(e)], error_count=1)
