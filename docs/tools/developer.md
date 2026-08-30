# Developer Tools

Everyday developer utilities — formatting, decoding, generating, testing, and encoding.

---

## Formatters

| Tool | Description | Input → Output |
|---|---|---|
| `json-formatter` | Pretty-print JSON with configurable indent and sort keys | JSON → JSON |
| `code-formatter` | Format code in any language (Python, JS, TS, SQL, CSS, HTML) | Text → Text |
| `markdown-preview` | Render Markdown as HTML and preview | Markdown → HTML |
| `html-preview` | Render an HTML snippet and screenshot it | HTML → PNG |
| `api-response-formatter` | Format and annotate an API response JSON for readability | JSON → JSON |

## Encoding / Decoding

| Tool | Description | Input → Output |
|---|---|---|
| `base64-encoder` | Encode text or binary to Base64 | Text → Text |
| `base64-decoder` | Decode Base64 to text | Text → Text |
| `url-encoder` | URL-encode a string (percent encoding) | Text → Text |
| `url-decoder` | URL-decode a percent-encoded string | Text → Text |
| `jwt-decoder` | Decode and inspect a JWT (header, payload, signature) | Text (JWT) → JSON |
| `html-entity-encoder` | Encode special characters to HTML entities | Text → Text |
| `html-entity-decoder` | Decode HTML entities to characters | Text → Text |

## Generators

| Tool | Description | Input → Output |
|---|---|---|
| `uuid-generator` | Generate one or more UUIDs (v4, v7) | — → Text |
| `hash-generator` | Generate MD5, SHA-1, SHA-256, SHA-512 hash | Text → Text |
| `cron-builder` | Build and explain cron expressions visually | — → Text |
| `timestamp-converter` | Convert between Unix timestamp, ISO 8601, and human-readable | Text → JSON |
| `http-request-builder` | Build a curl command / Fetch call / Python requests snippet | — → Text |

## Testers

| Tool | Description | Input → Output |
|---|---|---|
| `regex-tester` | Test a regex pattern against input text — show all matches | Text + pattern → JSON |
| `diff-viewer` | Compare two text snippets line-by-line | Text × 2 → HTML |
