# Utility Tools

General-purpose tools that don't fit a specific domain. Quick, standalone, instantly useful.

---

## Encoding and Hashing

| Tool | Description | Input → Output |
|---|---|---|
| `hash-generator` | Generate MD5, SHA-1, SHA-256, or SHA-512 hash | Text → Text |
| `hmac-generator` | Generate an HMAC with a secret key | Text + secret → Text |
| `password-generator` | Generate a secure random password with configurable rules | — → Text |
| `random-data-generator` | Generate random data matching a JSON schema | Schema → JSON |

## Encoding Utilities

| Tool | Description | Input → Output |
|---|---|---|
| `base64-encoder` | Encode text or binary to Base64 (also in Developer family) | Text → Text |
| `base64-decoder` | Decode Base64 string | Text → Text |
| `binary-to-text` | Convert binary/hex string to text | Text → Text |

## Visual Utilities

| Tool | Description | Input → Output |
|---|---|---|
| `color-picker` | Pick a color and get hex, RGB, HSL, and CMYK values | — → JSON |
| `color-converter` | Convert between hex, RGB, HSL, CMYK, and CSS color formats | Text → JSON |
| `qr-code-generator` | Generate a QR code for any text or URL | Text → PNG |
| `barcode-generator` | Generate a barcode (Code 128, EAN, QR) | Text → PNG |

## Text Utilities

| Tool | Description | Input → Output |
|---|---|---|
| `text-diff` | Compare two text strings line-by-line | Text × 2 → HTML |
| `word-counter` | Count words, characters, paragraphs, sentences, reading time | Text → JSON |
| `case-converter` | Convert between camelCase, snake_case, PascalCase, kebab-case, SCREAMING_SNAKE | Text → Text |
| `lorem-ipsum-generator` | Generate placeholder text | — → Text |
| `whitespace-cleaner` | Remove leading/trailing/extra whitespace | Text → Text |
