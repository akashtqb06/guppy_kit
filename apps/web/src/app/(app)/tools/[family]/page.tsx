import Link from "next/link";
import type { Metadata } from "next";

const TOOL_DETAILS: Record<string, { name: string; icon: string; description: string; tools: Array<{ id: string; name: string; description: string }> }> = {
  data: {
    name: "Data",
    icon: "📊",
    description: "Convert, profile, clean, and transform tabular data.",
    tools: [
      { id: "csv-to-json", name: "CSV → JSON", description: "Convert CSV files to JSON arrays" },
      { id: "json-to-csv", name: "JSON → CSV", description: "Convert JSON arrays to CSV" },
      { id: "excel-to-json", name: "Excel → JSON", description: "Convert Excel spreadsheets to JSON" },
      { id: "json-formatter", name: "JSON Formatter", description: "Beautify and validate JSON" },
      { id: "csv-profiler", name: "CSV Profiler", description: "Profile and summarize CSV data" },
    ],
  },
  developer: {
    name: "Developer",
    icon: "⚡",
    description: "Format, encode, decode, validate, and generate utilities.",
    tools: [
      { id: "json-formatter", name: "JSON Formatter", description: "Beautify and validate JSON" },
      { id: "jwt-decoder", name: "JWT Decoder", description: "Decode and inspect JWT tokens" },
      { id: "base64", name: "Base64", description: "Encode and decode Base64 strings" },
      { id: "url-encoder", name: "URL Encoder", description: "URL-encode or decode strings" },
      { id: "uuid-generator", name: "UUID Generator", description: "Generate UUIDs in bulk" },
      { id: "regex-tester", name: "Regex Tester", description: "Test and debug regular expressions" },
    ],
  },
  database: {
    name: "Database",
    icon: "🗄️",
    description: "Design schemas, generate SQL, and visualize database relationships.",
    tools: [
      { id: "sql-formatter", name: "SQL Formatter", description: "Format and beautify SQL queries" },
      { id: "sql-validator", name: "SQL Validator", description: "Validate SQL syntax" },
      { id: "er-diagram", name: "ER Diagram", description: "Generate ER diagrams from SQL" },
      { id: "schema-designer", name: "Schema Designer", description: "Visual database schema designer" },
    ],
  },
  documents: {
    name: "Documents",
    icon: "📄",
    description: "Convert, merge, split, and compare document files.",
    tools: [
      { id: "pdf-to-text", name: "PDF → Text", description: "Extract text from PDF files" },
      { id: "markdown-to-pdf", name: "Markdown → PDF", description: "Convert Markdown to PDF" },
      { id: "pdf-merger", name: "PDF Merger", description: "Merge multiple PDFs into one" },
    ],
  },
  visualization: {
    name: "Visualization",
    icon: "📈",
    description: "Build charts, diagrams, flowcharts, and architecture maps.",
    tools: [
      { id: "bar-chart", name: "Bar Chart", description: "Create bar charts from data" },
      { id: "line-chart", name: "Line Chart", description: "Visualize trends with line charts" },
      { id: "pie-chart", name: "Pie Chart", description: "Proportional pie and donut charts" },
      { id: "flowchart", name: "Flowchart", description: "Mermaid-powered flowcharts" },
    ],
  },
  presentation: {
    name: "Presentation",
    icon: "🎯",
    description: "Create, edit, and export slide decks.",
    tools: [
      { id: "presentation-builder", name: "Presentation Builder", description: "Build slides from data" },
    ],
  },
  workflow: {
    name: "Workflow",
    icon: "🔁",
    description: "Chain tools together in visual data pipelines.",
    tools: [
      { id: "pipeline-builder", name: "Pipeline Builder", description: "Visual tool pipeline builder" },
    ],
  },
  utilities: {
    name: "Utilities",
    icon: "🔧",
    description: "Hash, encode, convert, and miscellaneous helpers.",
    tools: [
      { id: "hash-generator", name: "Hash Generator", description: "MD5, SHA-1, SHA-256, SHA-512" },
      { id: "url-encoder", name: "URL Encoder", description: "URL-encode or decode strings" },
      { id: "timestamp-converter", name: "Timestamp Converter", description: "Convert Unix timestamps" },
      { id: "color-picker", name: "Color Picker", description: "Pick colors and convert formats" },
    ],
  },
};

interface Props {
  params: Promise<{ family: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { family } = await params;
  const info = TOOL_DETAILS[family];
  return { title: info?.name ?? family };
}

export default async function ToolFamilyPage({ params }: Props) {
  const { family } = await params;
  const info = TOOL_DETAILS[family];

  if (!info) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Unknown tool family: {family}</p>
      </div>
    );
  }

  return (
    <div className="px-8 py-8 max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        <span className="text-4xl">{info.icon}</span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{info.name}</h1>
          <p className="text-sm text-muted-foreground">{info.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {info.tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${family}/${tool.id}`}
            id={`tool-link-${tool.id}`}
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-sm hover:-translate-y-0.5"
          >
            <div
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
              style={{ background: "oklch(0.5 0.25 264 / 0.1)" }}
            >
              🛠️
            </div>
            <div>
              <p className="font-semibold text-sm">{tool.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
            </div>
            <svg className="ml-auto mt-1 h-4 w-4 shrink-0 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
