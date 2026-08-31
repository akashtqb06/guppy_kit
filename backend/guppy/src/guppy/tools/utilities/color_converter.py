from __future__ import annotations

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class ColorConverterInput(BaseModel):
    color: str


class ColorConverterOutput(BaseModel):
    hex: str
    rgb: dict
    hsl: dict
    is_valid: bool


class ColorConverterTool(BaseTool[ColorConverterInput, NoConfig, ColorConverterOutput]):
    name = "color-converter"
    version = "1.0.0"
    category = ToolCategory.UTILITIES
    icon = "🎨"
    description = "Convert colors."
    tags = ["color", "utilities", "converter"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON

    input_schema = ColorConverterInput
    output_schema = ColorConverterOutput
    config_schema = NoConfig

    async def execute(self, input: ColorConverterInput, config: NoConfig) -> ColorConverterOutput:
        color = input.color.strip().lower()
        r, g, b = 0, 0, 0
        is_valid = False

        try:
            if color.startswith("#"):
                color = color[1:]

            if color.startswith("rgb("):
                parts = color[4:-1].split(",")
                r, g, b = int(parts[0].strip()), int(parts[1].strip()), int(parts[2].strip())
                is_valid = True
            elif len(color) == 6:
                r = int(color[0:2], 16)
                g = int(color[2:4], 16)
                b = int(color[4:6], 16)
                is_valid = True
            elif len(color) == 3:
                r = int(color[0] * 2, 16)
                g = int(color[1] * 2, 16)
                b = int(color[2] * 2, 16)
                is_valid = True

        except Exception:
            is_valid = False

        if not is_valid:
            return ColorConverterOutput(
                hex="", rgb={"r": 0, "g": 0, "b": 0}, hsl={"h": 0, "s": 0, "l": 0}, is_valid=False
            )

        hex_val = f"#{r:02x}{g:02x}{b:02x}"

        # Calculate HSL
        r_norm, g_norm, b_norm = r / 255.0, g / 255.0, b / 255.0
        cmax = max(r_norm, g_norm, b_norm)
        cmin = min(r_norm, g_norm, b_norm)
        delta = cmax - cmin

        lightness = (cmax + cmin) / 2
        s = 0 if delta == 0 else delta / (1 - abs(2 * lightness - 1))
        h = 0
        if delta != 0:
            if cmax == r_norm:
                h = 60 * (((g_norm - b_norm) / delta) % 6)
            elif cmax == g_norm:
                h = 60 * (((b_norm - r_norm) / delta) + 2)
            else:
                h = 60 * (((r_norm - g_norm) / delta) + 4)

        return ColorConverterOutput(
            hex=hex_val,
            rgb={"r": r, "g": g, "b": b},
            hsl={"h": round(h, 2), "s": round(s, 2), "l": round(lightness, 2)},
            is_valid=True,
        )
