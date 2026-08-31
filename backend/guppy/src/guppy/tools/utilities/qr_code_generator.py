from __future__ import annotations

from typing import Literal

import qrcode
import qrcode.image.svg
from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class QrCodeGeneratorInput(BaseModel):
    content: str
    size: int = Field(default=200, ge=100, le=1000)
    error_correction: Literal["L", "M", "Q", "H"] = "M"


class QrCodeGeneratorOutput(BaseModel):
    svg: str
    content: str
    module_count: int


class QrCodeGeneratorTool(BaseTool[QrCodeGeneratorInput, NoConfig, QrCodeGeneratorOutput]):
    name = "qr-code-generator"
    version = "1.0.0"
    category = ToolCategory.UTILITIES
    description = "A standard tool implementation."
    tags = ["utilities", "utility"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.SVG
    icon = "📱"

    input_schema = QrCodeGeneratorInput
    output_schema = QrCodeGeneratorOutput
    config_schema = NoConfig

    async def execute(self, input: QrCodeGeneratorInput, config: NoConfig) -> QrCodeGeneratorOutput:
        ec_map = {
            "L": qrcode.constants.ERROR_CORRECT_L,
            "M": qrcode.constants.ERROR_CORRECT_M,
            "Q": qrcode.constants.ERROR_CORRECT_Q,
            "H": qrcode.constants.ERROR_CORRECT_H,
        }
        qr = qrcode.QRCode(
            error_correction=ec_map[input.error_correction],
            box_size=10,
            border=4,
        )
        qr.add_data(input.content)
        qr.make(fit=True)

        factory = qrcode.image.svg.SvgImage
        img = qr.make_image(image_factory=factory)

        import io

        stream = io.BytesIO()
        img.save(stream)

        svg_content = stream.getvalue().decode("utf-8")
        module_count = len(qr.modules) if hasattr(qr, "modules") else 0

        return QrCodeGeneratorOutput(
            svg=svg_content, content=input.content, module_count=module_count
        )
