"""String Utilities — common string operations in one tool."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class Input(BaseModel):
    text: str = Field(description="Input text")
    operation: Literal[
        "trim",
        "trim_lines",
        "reverse",
        "count_chars",
        "count_words",
        "remove_duplicates",
        "sort_lines",
        "deduplicate_lines",
        "remove_empty_lines",
        "add_line_numbers",
        "extract_emails",
        "extract_urls",
        "count_occurrences",
    ] = Field(description="Operation to perform")
    search: str = Field(default="", description="Search string (used by count_occurrences)")
    case_sensitive: bool = Field(default=True)


class Output(BaseModel):
    result: str
    count: int | None = None
    items: list[str] | None = None
    original_length: int
    result_length: int


class StringUtilitiesTool(BaseTool):
    name = "string-utilities"
    version = "1.0.0"
    category = ToolCategory.UTILITIES
    description = (
        "Common string operations: trim, reverse, sort lines, extract emails/URLs, and more."
    )
    tags = ["string", "text", "utilities", "trim", "sort", "extract"]  # noqa: RUF012
    output_artifact_type = ArtifactType.TEXT
    input_artifact_types = []  # noqa: RUF012
    input_schema = Input
    output_schema = Output
    config_schema = NoConfig
    icon = "text-cursor"

    async def execute(self, input: Input, config: NoConfig) -> Output:
        import re

        text = input.text
        op = input.operation
        result = text
        count = None
        items = None

        if op == "trim":
            result = text.strip()
        elif op == "trim_lines":
            result = "\n".join(line.strip() for line in text.splitlines())
        elif op == "reverse":
            result = text[::-1]
        elif op == "count_chars":
            result = text
            count = len(text)
        elif op == "count_words":
            words = text.split()
            result = text
            count = len(words)
        elif op == "remove_duplicates":
            seen = set()
            chars = []
            for c in text:
                if c not in seen:
                    seen.add(c)
                    chars.append(c)
            result = "".join(chars)
        elif op == "sort_lines":
            lines = text.splitlines()
            result = "\n".join(
                sorted(lines, key=lambda line: line if input.case_sensitive else line.lower())
            )
        elif op == "deduplicate_lines":
            seen_lines: set[str] = set()
            unique: list[str] = []
            for line in text.splitlines():
                key = line if input.case_sensitive else line.lower()
                if key not in seen_lines:
                    seen_lines.add(key)
                    unique.append(line)
            result = "\n".join(unique)
            count = len(unique)
        elif op == "remove_empty_lines":
            result = "\n".join(line for line in text.splitlines() if line.strip())
        elif op == "add_line_numbers":
            lines = text.splitlines()
            width = len(str(len(lines)))
            result = "\n".join(f"{str(i + 1).rjust(width)}: {line}" for i, line in enumerate(lines))
        elif op == "extract_emails":
            pattern = r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
            items = re.findall(pattern, text)
            result = "\n".join(items)
            count = len(items)
        elif op == "extract_urls":
            pattern = r'https?://[^\s<>"]+'
            items = re.findall(pattern, text)
            result = "\n".join(items)
            count = len(items)
        elif op == "count_occurrences":
            if input.search:
                if input.case_sensitive:
                    count = text.count(input.search)
                else:
                    count = text.lower().count(input.search.lower())
            result = text

        return Output(
            result=result,
            count=count,
            items=items,
            original_length=len(text),
            result_length=len(result),
        )
