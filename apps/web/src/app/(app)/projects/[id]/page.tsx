"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Badge, Button, Tabs, TabsContent, TabsList, TabsTrigger,
  Skeleton, Separator,
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage
} from "@guppy-kit/ui";
import { ArrowLeft, Clock, CheckCircle, XCircle, Download, FileText, Play, ArrowRight } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Execution {
  id: string;
  tool_name: string;
  tool_version: string;
  status: "completed" | "failed" | "running";
  started_at: string;
  duration_ms: number | null;
  artifact_id: string | null;
}

export default function ProjectWorkspacePage() {
  const params = useParams();
  const id = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [projRes, execRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/projects/${id}`, { credentials: "include" }),
          fetch(`${API_BASE}/api/v1/executions?limit=50&project_id=${id}`, { credentials: "include" }).catch(() => null)
        ]);

        if (!projRes.ok) {
          if (projRes.status === 404) {
            throw new Error("Project not found");
          }
          throw new Error("Failed to load project");
        }
        
        const projData = await projRes.json();
        setProject(projData);

        if (execRes && execRes.ok) {
          const execData = await execRes.json();
          setExecutions(Array.isArray(execData) ? execData : (execData.items || []));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) fetchData();
  }, [id]);

  if (error === "Project not found") {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Project not found</h1>
        <p className="text-muted-foreground mb-8">The project you are looking for does not exist.</p>
        <Link href="/projects">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        <p>{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (isLoading || !project) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-2/3 mt-4" />
        <Skeleton className="h-24 w-full mt-8" />
        <Skeleton className="h-64 w-full mt-8" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/projects" />}>Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">{project.name}</h1>
        <p className="text-muted-foreground">{project.description}</p>
      </div>
      
      <Separator />

      <Tabs defaultValue="executions" className="w-full">
        <TabsList>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="executions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>History of tool runs in this project</CardDescription>
            </CardHeader>
            <CardContent>
              {executions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                  <Play className="h-12 w-12 mb-4 text-muted-foreground opacity-50" />
                  <p className="mb-2 font-medium">No executions yet</p>
                  <p className="text-sm">Run a tool to see results here</p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="px-4 py-3 font-medium">Tool</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Duration</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium text-right">Artifact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {executions.map((exec) => (
                        <tr key={exec.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <Link href={`/tools/${exec.tool_name.split('-')[0]}/${exec.tool_name}`} className="font-medium hover:underline flex items-center gap-2">
                              {exec.tool_name}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <Badge 
                              variant={exec.status === "completed" ? "default" : exec.status === "failed" ? "destructive" : "secondary"}
                              className={`flex w-fit items-center gap-1 ${exec.status === "completed" ? "bg-green-600 hover:bg-green-700 text-white" : exec.status === "running" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
                            >
                              {exec.status === "completed" && <CheckCircle className="h-3 w-3" />}
                              {exec.status === "failed" && <XCircle className="h-3 w-3" />}
                              {exec.status === "running" && <Clock className="h-3 w-3" />}
                              {exec.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {exec.duration_ms ? `${(exec.duration_ms / 1000).toFixed(2)}s` : "-"}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(exec.started_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {exec.artifact_id ? (
                              <Button variant="ghost" size="icon" title="Download Artifact">
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                            ) : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="artifacts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Artifacts</CardTitle>
              <CardDescription>Files and documents generated in this project</CardDescription>
            </CardHeader>
            <CardContent>
              {executions.filter(e => e.artifact_id).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                  <FileText className="h-12 w-12 mb-4 text-muted-foreground opacity-50" />
                  <p className="mb-2 font-medium">No artifacts yet</p>
                  <p className="text-sm">Artifacts are created when tools run</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {executions.filter(e => e.artifact_id).map((exec) => (
                      <div key={exec.id} className="p-4 border rounded-lg flex items-center justify-between hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded flex items-center justify-center">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm truncate">{exec.tool_name} output</p>
                            <p className="text-xs text-muted-foreground">{new Date(exec.started_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-3 w-3" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
