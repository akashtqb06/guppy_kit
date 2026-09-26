from __future__ import annotations

import math
import secrets
import string

from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class PasswordGeneratorInput(BaseModel):
    length: int = Field(default=16, ge=4, le=128)
    count: int = Field(default=5, ge=1, le=20)
    include_uppercase: bool = True
    include_lowercase: bool = True
    include_digits: bool = True
    include_symbols: bool = False
    exclude_ambiguous: bool = True


class PasswordGeneratorOutput(BaseModel):
    passwords: list[str]
    length: int
    charset_size: int
    entropy_bits: float


class PasswordGeneratorTool(BaseTool[PasswordGeneratorInput, NoConfig, PasswordGeneratorOutput]):
    name = "password-generator"
    version = "1.0.0"
    category = ToolCategory.UTILITIES
    description = "Generate cryptographically secure random passwords."
    tags = ["utilities", "password", "security"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.TEXT
    icon = "🔑"

    input_schema = PasswordGeneratorInput
    output_schema = PasswordGeneratorOutput
    config_schema = NoConfig

    async def execute(
        self, input: PasswordGeneratorInput, config: NoConfig
    ) -> PasswordGeneratorOutput:
        chars = ""
        ambiguous = "0OIl1"

        upper = string.ascii_uppercase
        lower = string.ascii_lowercase
        digits = string.digits
        symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"

        if input.exclude_ambiguous:
            upper = "".join(c for c in upper if c not in ambiguous)
            lower = "".join(c for c in lower if c not in ambiguous)
            digits = "".join(c for c in digits if c not in ambiguous)
            symbols = "".join(c for c in symbols if c not in ambiguous)

        if input.include_uppercase:
            chars += upper
        if input.include_lowercase:
            chars += lower
        if input.include_digits:
            chars += digits
        if input.include_symbols:
            chars += symbols

        if not chars:
            # Fallback if everything is excluded
            chars = string.ascii_lowercase

        charset_size = len(chars)
        entropy = input.length * math.log2(charset_size) if charset_size > 0 else 0

        passwords = []
        for _ in range(input.count):
            pwd = "".join(secrets.choice(chars) for _ in range(input.length))
            passwords.append(pwd)

        return PasswordGeneratorOutput(
            passwords=passwords,
            length=input.length,
            charset_size=charset_size,
            entropy_bits=entropy,
        )
