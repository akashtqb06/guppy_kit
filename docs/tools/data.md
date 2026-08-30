# Data Tools

Convert, profile, clean, transform, compare, and generate tabular and structured data.

---

## Converters

| Tool | Description | Input → Output |
|---|---|---|
| `csv-to-json` | Convert CSV to a JSON array of objects | CSV → JSON |
| `json-to-csv` | Convert a JSON array to CSV | JSON → CSV |
| `excel-to-json` | Read all sheets from an Excel workbook into JSON | XLSX → JSON |
| `json-to-excel` | Convert JSON arrays to Excel sheets | JSON → XLSX |
| `csv-to-excel` | Convert CSV to a single Excel sheet | CSV → XLSX |
| `xml-to-json` | Parse XML document to JSON | Text (XML) → JSON |
| `yaml-to-json` | Parse YAML to JSON | Text (YAML) → JSON |
| `json-to-yaml` | Convert JSON to YAML | JSON → Text (YAML) |
| `parquet-to-csv` | Read a Parquet file and export as CSV | Parquet → CSV |
| `csv-to-parquet` | Convert CSV to Parquet format | CSV → Parquet |

## Inspection and Analysis

| Tool | Description | Input → Output |
|---|---|---|
| `csv-profiler` | Statistical profile of a CSV dataset (null %, types, distributions) | CSV → JSON |
| `json-formatter` | Pretty-print and format JSON with configurable indent | JSON → JSON |
| `json-diff` | Compare two JSON objects and output a structured diff | JSON × 2 → JSON |
| `data-type-detector` | Infer column data types in a CSV | CSV → JSON |

## Transformation and Cleaning

| Tool | Description | Input → Output |
|---|---|---|
| `data-cleaner` | Trim whitespace, drop nulls, normalise types, remove duplicates | CSV / JSON → CSV |
| `column-mapper` | Rename, reorder, drop, or split columns | CSV / JSON → CSV / JSON |
| `data-transformer` | Apply custom transformation rules (filter, map, aggregate) | CSV / JSON + rules → CSV / JSON |
| `data-generator` | Generate synthetic datasets from a JSON schema | Schema spec → CSV / JSON |
