from __future__ import annotations

import difflib
from typing import Literal

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class TextDiffInput(BaseModel):
    text_a: str
    text_b: str
    mode: Literal["lines", "words", "chars"] = "lines"


class TextDiffOutput(BaseModel):
    diff: str
    additions: int
    deletions: int
    unchanged: int
    is_identical: bool


class TextDiffTool(BaseTool[TextDiffInput, NoConfig, TextDiffOutput]):
    name = "text-diff"
    version = "1.0.0"
    category = ToolCategory.DOCUMENTS
    description = "A standard tool implementation."
    tags = ["documents", "utility"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.TEXT
    icon = "🔄"

    input_schema = TextDiffInput
    output_schema = TextDiffOutput
    config_schema = NoConfig

    async def execute(self, input: TextDiffInput, config: NoConfig) -> TextDiffOutput:
        a = input.text_a
        b = input.text_b

        if input.mode == "lines":
            a_list = a.splitlines(keepends=True)
            b_list = b.splitlines(keepends=True)
            diff_gen = difflib.unified_diff(a_list, b_list, fromfile="text_a", tofile="text_b")
            diff = "".join(diff_gen)
            # count from ndiff to get accurate additions/deletions easily
            ndiff_gen = difflib.ndiff(a_list, b_list)
        elif input.mode == "words":
            import re

            a_list = re.split(r"(\s+)", a)
            b_list = re.split(r"(\s+)", b)
            ndiff_gen = difflib.ndiff(a_list, b_list)
            diff = "".join(ndiff_gen)
        else:
            a_list = list(a)
            b_list = list(b)
            ndiff_gen = difflib.ndiff(a_list, b_list)
            diff = "".join(ndiff_gen)

        additions, deletions, unchanged = 0, 0, 0
        if input.mode != "lines":
            ndiff_gen = difflib.ndiff(a_list, b_list)

        for line in ndiff_gen:
            if line.startswith("+ "):
                additions += 1
            elif line.startswith("- "):
                deletions += 1
            elif line.startswith("  "):
                unchanged += 1

        return TextDiffOutput(
            diff=diff,
            additions=additions,
            deletions=deletions,
            unchanged=unchanged,
            is_identical=(a == b),
        )
