"""XML Formatter & Validator — pretty-print and validate XML documents."""

from __future__ import annotations

import xml.dom.minidom
import xml.etree.ElementTree as ET

from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class Input(BaseModel):
    xml_content: str = Field(description="XML content to format or validate")
    indent: int = Field(default=2, ge=0, le=8, description="Indentation spaces")
    remove_blank_lines: bool = Field(default=True)
    strip_comments: bool = Field(default=False)


class Output(BaseModel):
    formatted: str
    is_valid: bool
    element_count: int
    root_element: str | None
    depth: int
    error: str | None = None


class XmlFormatterTool(BaseTool):
    name = "xml-formatter"
    version = "1.0.0"
    category = ToolCategory.DEVELOPER
    description = "Format, pretty-print, and validate XML documents."
    tags = ["xml", "format", "validate", "developer"]  # noqa: RUF012
    output_artifact_type = ArtifactType.TEXT
    input_artifact_types = []  # noqa: RUF012
    input_schema = Input
    output_schema = Output
    config_schema = NoConfig
    icon = "code-xml"

    async def execute(self, input: Input, config: NoConfig) -> Output:
        try:
            root = ET.fromstring(input.xml_content)
            dom = xml.dom.minidom.parseString(input.xml_content)
            formatted = dom.toprettyxml(indent=" " * input.indent)
            # Remove the XML declaration if it was not in original
            lines = formatted.split("\n")
            if (
                lines
                and lines[0].startswith("<?xml")
                and not input.xml_content.lstrip().startswith("<?xml")
            ):
                lines = lines[1:]
            if input.remove_blank_lines:
                lines = [line for line in lines if line.strip()]
            formatted = "\n".join(lines)

            def count_elements(el: ET.Element, depth=0) -> tuple[int, int]:
                total = 1
                max_depth = depth
                for child in el:
                    child_count, child_depth = count_elements(child, depth + 1)
                    total += child_count
                    max_depth = max(max_depth, child_depth)
                return total, max_depth

            elem_count, max_depth = count_elements(root)
            return Output(
                formatted=formatted,
                is_valid=True,
                element_count=elem_count,
                root_element=root.tag,
                depth=max_depth,
            )
        except ET.ParseError as e:
            return Output(
                formatted=input.xml_content,
                is_valid=False,
                element_count=0,
                root_element=None,
                depth=0,
                error=str(e),
            )
