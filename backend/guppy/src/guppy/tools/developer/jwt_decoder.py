from __future__ import annotations

import base64
import json
from datetime import UTC, datetime

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class JwtDecoderInput(BaseModel):
    token: str


class JwtDecoderOutput(BaseModel):
    header: dict
    payload: dict
    signature: str
    is_expired: bool
    raw_parts: list[str]


class JwtDecoderTool(BaseTool[JwtDecoderInput, NoConfig, JwtDecoderOutput]):
    name = "jwt-decoder"
    version = "1.0.0"
    category = ToolCategory.DEVELOPER
    icon = "🔑"
    description = "Decode JWT tokens without verifying the signature."
    tags = ["jwt", "developer", "decoder"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON

    input_schema = JwtDecoderInput
    output_schema = JwtDecoderOutput
    config_schema = NoConfig

    async def execute(self, input: JwtDecoderInput, config: NoConfig) -> JwtDecoderOutput:
        parts = input.token.split(".")
        if len(parts) != 3:
            raise ValueError("Invalid JWT token format.")

        def decode_part(part: str) -> dict:
            part += "=" * (-len(part) % 4)
            return json.loads(base64.urlsafe_b64decode(part).decode())

        header = decode_part(parts[0])
        payload = decode_part(parts[1])
        signature = parts[2]

        is_expired = False
        if "exp" in payload:
            exp_time = datetime.fromtimestamp(payload["exp"], tz=UTC)
            if exp_time < datetime.now(tz=UTC):
                is_expired = True

        return JwtDecoderOutput(
            header=header,
            payload=payload,
            signature=signature,
            is_expired=is_expired,
            raw_parts=parts,
        )
