from __future__ import annotations

import re

from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class RegexTesterInput(BaseModel):
    pattern: str
    text: str
    flags: list[str] = Field(default_factory=list)


class RegexTesterOutput(BaseModel):
    matches: list[dict]
    match_count: int
    is_valid_pattern: bool
    named_groups: dict[str, str] = Field(default_factory=dict)
    full_match: bool = False
    error: str | None = None


class RegexTesterTool(BaseTool[RegexTesterInput, NoConfig, RegexTesterOutput]):
    name = "regex-tester"
    version = "1.0.0"
    category = ToolCategory.DEVELOPER
    icon = ".*"
    description = "Test regular expressions."
    tags = ["regex", "developer", "tester"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON

    input_schema = RegexTesterInput
    output_schema = RegexTesterOutput
    config_schema = NoConfig

    async def execute(self, input: RegexTesterInput, config: NoConfig) -> RegexTesterOutput:
        try:
            re_flags = 0
            if "i" in input.flags:
                re_flags |= re.IGNORECASE
            if "m" in input.flags:
                re_flags |= re.MULTILINE
            if "s" in input.flags:
                re_flags |= re.DOTALL

            compiled = re.compile(input.pattern, re_flags)
            matches = []
            named_groups = {}
            for match in compiled.finditer(input.text):
                match_dict = {
                    "start": match.start(),
                    "end": match.end(),
                    "value": match.group(),
                    "groups": match.groups(),
                    "named_groups": match.groupdict(),
                }
                matches.append(match_dict)
                if match.groupdict():
                    named_groups.update(match.groupdict())

            full_match = False
            if compiled.fullmatch(input.text):
                full_match = True

            return RegexTesterOutput(
                matches=matches,
                match_count=len(matches),
                is_valid_pattern=True,
                named_groups=named_groups,
                full_match=full_match,
            )
        except Exception as exc:
            return RegexTesterOutput(
                matches=[], match_count=0, is_valid_pattern=False, error=str(exc)
            )
