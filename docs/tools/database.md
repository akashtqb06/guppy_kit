# Database Tools

Design, generate, visualize, document, and convert databases and SQL.

---

## SQL Tools

| Tool | Description | Input → Output |
|---|---|---|
| `sql-formatter` | Format and pretty-print SQL with configurable style | SQL → SQL |
| `sql-validator` | Validate SQL syntax and report errors with line numbers | SQL → JSON |
| `sql-generator` | Generate SQL from a natural language description | Text → SQL |
| `sql-diff` | Compare two SQL scripts and show structural differences | SQL × 2 → SQL (diff) |
| `query-explainer` | Explain a SQL query in plain English step by step | SQL → Markdown |
| `sql-to-json-schema` | Derive a JSON Schema from a SQL DDL | SQL → JSON |

## Design Tools

| Tool | Description | Input → Output |
|---|---|---|
| `schema-designer` | Visual schema designer — create tables, columns, types, constraints | — → SQL |
| `table-designer` | Design a single table and export as SQL DDL | — → SQL |
| `er-diagram-from-sql` | Generate an ER diagram from a SQL DDL schema | SQL → SVG |
| `er-diagram-builder` | Interactive ER diagram builder (draw entities and relationships) | — → SVG + Diagram JSON |

## Converters

| Tool | Description | Input → Output |
|---|---|---|
| `postgresql-to-mysql` | Convert PostgreSQL DDL to MySQL-compatible DDL | SQL → SQL |
| `mysql-to-postgresql` | Convert MySQL DDL to PostgreSQL-compatible DDL | SQL → SQL |
| `json-to-sql-schema` | Generate a CREATE TABLE statement from a JSON array | JSON → SQL |
| `sql-to-documentation` | Generate Markdown documentation from a SQL schema | SQL → Markdown |
