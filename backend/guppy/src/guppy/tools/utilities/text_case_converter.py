"""Text Case Converter — convert text between various case formats."""

from __future__ import annotations

import re

from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class Input(BaseModel):
    text: str = Field(description="Text to convert")


class Output(BaseModel):
    camel_case: str
    pascal_case: str
    snake_case: str
    screaming_snake: str
    kebab_case: str
    title_case: str
    upper_case: str
    lower_case: str
    dot_case: str
    path_case: str
    sentence_case: str
    word_count: int


class TextCaseConverterTool(BaseTool):
    name = "text-case-converter"
    version = "1.0.0"
    category = ToolCategory.UTILITIES
    description = "Convert text between camelCase, snake_case, kebab-case, PascalCase, and more."
    tags = ["text", "case", "convert", "camel", "snake", "kebab", "utilities"]  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON
    input_artifact_types = []  # noqa: RUF012
    input_schema = Input
    output_schema = Output
    config_schema = NoConfig
    icon = "type"

    async def execute(self, input: Input, config: NoConfig) -> Output:
        # Tokenize: split on spaces, underscores, hyphens, dots, and camelCase boundaries
        text = input.text.strip()
        # Insert space before uppercase letters that follow lowercase (camelCase split)
        text_split = re.sub(r"([a-z])([A-Z])", r"\1 \2", text)
        # Split on non-alphanumeric characters
        words = [w for w in re.split(r"[^a-zA-Z0-9]+", text_split) if w]
        lower_words = [w.lower() for w in words]

        camel = (
            lower_words[0] + "".join(w.capitalize() for w in lower_words[1:]) if lower_words else ""
        )
        pascal = "".join(w.capitalize() for w in lower_words)
        snake = "_".join(lower_words)
        screaming = "_".join(w.upper() for w in lower_words)
        kebab = "-".join(lower_words)
        title = " ".join(w.capitalize() for w in lower_words)
        upper = text.upper()
        lower = text.lower()
        dot = ".".join(lower_words)
        path = "/".join(lower_words)
        sentence = (" ".join(lower_words)).capitalize() if lower_words else ""

        return Output(
            camel_case=camel,
            pascal_case=pascal,
            snake_case=snake,
            screaming_snake=screaming,
            kebab_case=kebab,
            title_case=title,
            upper_case=upper,
            lower_case=lower,
            dot_case=dot,
            path_case=path,
            sentence_case=sentence,
            word_count=len(words),
        )
