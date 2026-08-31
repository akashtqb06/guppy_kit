from __future__ import annotations

import re

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class WordCountInput(BaseModel):
    text: str


class WordCountOutput(BaseModel):
    word_count: int
    char_count: int
    char_no_spaces: int
    line_count: int
    paragraph_count: int
    sentence_count: int
    avg_word_length: float


class WordCountTool(BaseTool[WordCountInput, NoConfig, WordCountOutput]):
    name = "word-count"
    version = "1.0.0"
    category = ToolCategory.DOCUMENTS
    description = "A standard tool implementation."
    tags = ["documents", "utility"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON
    icon = "📝"

    input_schema = WordCountInput
    output_schema = WordCountOutput
    config_schema = NoConfig

    async def execute(self, input: WordCountInput, config: NoConfig) -> WordCountOutput:
        text = input.text
        char_count = len(text)
        char_no_spaces = len(text.replace(" ", "").replace("\n", "").replace("\r", ""))
        words = re.findall(r"\b\w+\b", text)
        word_count = len(words)
        lines = text.splitlines()
        line_count = len(lines)
        paragraphs = [p for p in re.split(r"\n\s*\n", text) if p.strip()]
        paragraph_count = len(paragraphs)
        sentences = re.split(r"[.!?]+", text)
        sentences = [s for s in sentences if s.strip()]
        sentence_count = len(sentences)
        avg_word_length = sum(len(w) for w in words) / word_count if word_count > 0 else 0.0
        return WordCountOutput(
            word_count=word_count,
            char_count=char_count,
            char_no_spaces=char_no_spaces,
            line_count=line_count,
            paragraph_count=paragraph_count,
            sentence_count=sentence_count,
            avg_word_length=round(avg_word_length, 2),
        )
