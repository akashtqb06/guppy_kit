# Document Tools

Convert, merge, split, compare, and extract content from document files.

---

## Converters

| Tool | Description | Input → Output |
|---|---|---|
| `pdf-to-text` | Extract all text from a PDF | PDF → Text |
| `pdf-to-markdown` | Extract text from a PDF and format as Markdown | PDF → Markdown |
| `markdown-to-pdf` | Convert a Markdown document to PDF | Markdown → PDF |
| `markdown-to-docx` | Convert Markdown to a Word document | Markdown → DOCX |
| `docx-to-markdown` | Convert a Word document to Markdown | DOCX → Markdown |
| `docx-to-pdf` | Convert a Word document to PDF | DOCX → PDF |
| `html-to-pdf` | Convert an HTML page or snippet to PDF | HTML → PDF |
| `csv-to-pdf` | Render a CSV file as a formatted table PDF | CSV → PDF |

## Manipulation

| Tool | Description | Input → Output |
|---|---|---|
| `pdf-merger` | Merge multiple PDF files into one | PDF × N → PDF |
| `pdf-splitter` | Split a PDF by page range into multiple PDFs | PDF → PDF × N |
| `pdf-metadata` | Read and display PDF metadata (title, author, pages, etc.) | PDF → JSON |

## Analysis

| Tool | Description | Input → Output |
|---|---|---|
| `document-compare` | Compare two text or Markdown documents and highlight differences | Text/Markdown × 2 → HTML |
| `word-counter` | Count words, characters, paragraphs, and reading time | Text/Markdown → JSON |
| `document-extractor` | Extract structured data from a PDF or DOCX to JSON | PDF/DOCX → JSON |
