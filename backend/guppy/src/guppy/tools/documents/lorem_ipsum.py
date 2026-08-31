from __future__ import annotations

import itertools

from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class LoremIpsumInput(BaseModel):
    paragraphs: int = Field(default=3, ge=1, le=50)
    words_per_paragraph: int = Field(default=80, ge=10, le=500)


class LoremIpsumOutput(BaseModel):
    text: str
    word_count: int
    paragraph_count: int


class LoremIpsumTool(BaseTool[LoremIpsumInput, NoConfig, LoremIpsumOutput]):
    name = "lorem-ipsum"
    version = "1.0.0"
    category = ToolCategory.DOCUMENTS
    description = "A standard tool implementation."
    tags = ["documents", "utility"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.TEXT
    icon = "✍️"

    input_schema = LoremIpsumInput
    output_schema = LoremIpsumOutput
    config_schema = NoConfig

    async def execute(self, input: LoremIpsumInput, config: NoConfig) -> LoremIpsumOutput:
        lorem_words = [
            "lorem",
            "ipsum",
            "dolor",
            "sit",
            "amet",
            "consectetur",
            "adipiscing",
            "elit",
            "sed",
            "do",
            "eiusmod",
            "tempor",
            "incididunt",
            "ut",
            "labore",
            "et",
            "dolore",
            "magna",
            "aliqua",
            "ut",
            "enim",
            "ad",
            "minim",
            "veniam",
            "quis",
            "nostrud",
            "exercitation",
            "ullamco",
            "laboris",
            "nisi",
            "ut",
            "aliquip",
            "ex",
            "ea",
            "commodo",
            "consequat",
            "duis",
            "aute",
            "irure",
            "dolor",
            "in",
            "reprehenderit",
            "in",
            "voluptate",
            "velit",
            "esse",
            "cillum",
            "dolore",
            "eu",
            "fugiat",
            "nulla",
            "pariatur",
            "excepteur",
            "sint",
            "occaecat",
            "cupidatat",
            "non",
            "proident",
            "sunt",
            "in",
            "culpa",
            "qui",
            "officia",
            "deserunt",
            "mollit",
            "anim",
            "id",
            "est",
            "laborum",
        ]

        cycle_words = itertools.cycle(lorem_words)
        paragraphs_text = []
        total_words = 0

        for _ in range(input.paragraphs):
            p_words = []
            for i in range(input.words_per_paragraph):
                w = next(cycle_words)
                if i == 0:
                    w = w.capitalize()
                p_words.append(w)

            p_text = " ".join(p_words) + "."
            paragraphs_text.append(p_text)
            total_words += input.words_per_paragraph

        return LoremIpsumOutput(
            text="\n\n".join(paragraphs_text),
            word_count=total_words,
            paragraph_count=input.paragraphs,
        )
