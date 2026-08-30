import type { Metadata } from "next";
import { ToolWorkspace } from "@guppy-kit/ui";

interface Props {
  params: Promise<{ family: string; tool: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool } = await params;
  const name = tool
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return { title: name };
}

export default async function ToolPage({ params }: Props) {
  const { tool } = await params;

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <ToolWorkspace toolName={tool} layout="split" />
    </div>
  );
}
