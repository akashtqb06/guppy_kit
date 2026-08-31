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

import { Breadcrumb } from "@/components/Breadcrumb";

export default async function ToolPage({ params }: Props) {
  const { tool, family } = await params;
  
  const name = tool
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
    
  const familyName = family
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="px-6 py-4 border-b border-border">
        <Breadcrumb items={[
          { label: familyName, href: `/tools/${family}` },
          { label: name }
        ]} />
      </div>
      <div className="flex-1 min-h-0">
        <ToolWorkspace toolName={tool} layout="split" />
      </div>
    </div>
  );
}
