from __future__ import annotations

from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig

HTTP_STATUS_CODES = {
    100: (
        "Continue",
        "1xx Informational",
        "The server has received the request headers and the client should proceed to send the request body.",  # noqa: E501
    ),
    101: (
        "Switching Protocols",
        "1xx Informational",
        "The requester has asked the server to switch protocols and the server has agreed to do so.",  # noqa: E501
    ),
    200: ("OK", "2xx Success", "Standard response for successful HTTP requests."),
    201: (
        "Created",
        "2xx Success",
        "The request has been fulfilled, resulting in the creation of a new resource.",
    ),
    202: (
        "Accepted",
        "2xx Success",
        "The request has been accepted for processing, but the processing has not been completed.",
    ),
    204: (
        "No Content",
        "2xx Success",
        "The server successfully processed the request and is not returning any content.",
    ),
    301: (
        "Moved Permanently",
        "3xx Redirection",
        "This and all future requests should be directed to the given URI.",
    ),
    302: ("Found", "3xx Redirection", "Tells the client to look at (browse to) another URL."),
    304: (
        "Not Modified",
        "3xx Redirection",
        "Indicates that the resource has not been modified since the version specified by the request headers.",  # noqa: E501
    ),
    307: (
        "Temporary Redirect",
        "3xx Redirection",
        "In this case, the request should be repeated with another URI; however, future requests should still use the original URI.",  # noqa: E501
    ),
    308: (
        "Permanent Redirect",
        "3xx Redirection",
        "The request and all future requests should be repeated using another URI.",
    ),
    400: (
        "Bad Request",
        "4xx Client Error",
        "The server cannot or will not process the request due to an apparent client error.",
    ),
    401: (
        "Unauthorized",
        "4xx Client Error",
        "Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided.",  # noqa: E501
    ),
    403: (
        "Forbidden",
        "4xx Client Error",
        "The request contained valid data and was understood by the server, but the server is refusing action.",  # noqa: E501
    ),
    404: (
        "Not Found",
        "4xx Client Error",
        "The requested resource could not be found but may be available in the future.",
    ),
    405: (
        "Method Not Allowed",
        "4xx Client Error",
        "A request method is not supported for the requested resource.",
    ),
    408: ("Request Timeout", "4xx Client Error", "The server timed out waiting for the request."),
    409: (
        "Conflict",
        "4xx Client Error",
        "Indicates that the request could not be processed because of conflict in the current state of the resource.",  # noqa: E501
    ),
    410: (
        "Gone",
        "4xx Client Error",
        "Indicates that the resource requested is no longer available and will not be available again.",  # noqa: E501
    ),
    422: (
        "Unprocessable Entity",
        "4xx Client Error",
        "The request was well-formed but was unable to be followed due to semantic errors.",
    ),
    429: (
        "Too Many Requests",
        "4xx Client Error",
        "The user has sent too many requests in a given amount of time.",
    ),
    500: (
        "Internal Server Error",
        "5xx Server Error",
        "A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.",  # noqa: E501
    ),
    501: (
        "Not Implemented",
        "5xx Server Error",
        "The server either does not recognize the request method, or it lacks the ability to fulfil the request.",  # noqa: E501
    ),
    502: (
        "Bad Gateway",
        "5xx Server Error",
        "The server was acting as a gateway or proxy and received an invalid response from the upstream server.",  # noqa: E501
    ),
    503: (
        "Service Unavailable",
        "5xx Server Error",
        "The server cannot handle the request (because it is overloaded or down for maintenance).",
    ),
    504: (
        "Gateway Timeout",
        "5xx Server Error",
        "The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.",  # noqa: E501
    ),
}


class HttpStatusCodesInput(BaseModel):
    code: int = Field(ge=100, le=599)
    include_description: bool = True


class HttpStatusCodesOutput(BaseModel):
    code: int
    name: str
    category: str
    description: str
    is_error: bool


class HttpStatusCodesTool(BaseTool[HttpStatusCodesInput, NoConfig, HttpStatusCodesOutput]):
    name = "http-status-codes"
    version = "1.0.0"
    category = ToolCategory.DEVELOPER
    description = "Look up an HTTP status code: name, category, and description."
    tags = ["developer", "http", "status"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON
    icon = "🌐"

    input_schema = HttpStatusCodesInput
    output_schema = HttpStatusCodesOutput
    config_schema = NoConfig

    async def execute(self, input: HttpStatusCodesInput, config: NoConfig) -> HttpStatusCodesOutput:
        data = HTTP_STATUS_CODES.get(input.code)

        is_error = input.code >= 400

        if data:
            name, category, desc = data
            return HttpStatusCodesOutput(
                code=input.code,
                name=name,
                category=category,
                description=desc if input.include_description else "",
                is_error=is_error,
            )
        else:
            cat_digit = input.code // 100
            categories = {
                1: "1xx Informational",
                2: "2xx Success",
                3: "3xx Redirection",
                4: "4xx Client Error",
                5: "5xx Server Error",
            }
            category = categories.get(cat_digit, "Unknown")

            return HttpStatusCodesOutput(
                code=input.code,
                name="Unknown Status Code",
                category=category,
                description="No detailed description available."
                if input.include_description
                else "",
                is_error=is_error,
            )
