"use client";

import { useEffect, useState } from "react";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, Input, Textarea, Card, CardHeader, CardTitle, CardContent, CardFooter, Badge, DialogTrigger } from "@guppy-kit/ui";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/projects`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : (data.items || []));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newName, description: newDesc }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      setIsOpen(false);
      setNewName("");
      setNewDesc("");
      await fetchProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error creating project");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button className="bg-brand text-brand-foreground hover:bg-brand/90" />}>
            New Project
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder="e.g. Q3 Analysis" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)} 
                  placeholder="Brief description of the project" 
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button onClick={handleCreate} disabled={!newName.trim() || isCreating} className="bg-brand text-brand-foreground hover:bg-brand/90">
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <div className="p-8 text-center border border-destructive rounded-xl bg-destructive/10 text-destructive">
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchProjects}>Retry</Button>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-brand" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center border border-border border-dashed rounded-xl">
          <div className="mb-4 text-4xl">🗂️</div>
          <h2 className="mb-2 text-xl font-semibold">No projects yet</h2>
          <p className="mb-6 text-sm text-muted-foreground max-w-md">
            Create your first project to organize your work.
          </p>
          <Button onClick={() => setIsOpen(true)} className="bg-brand text-brand-foreground hover:bg-brand/90">
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col hover:border-foreground/20 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-1" title={project.name}>{project.name}</CardTitle>
                  <Badge variant="outline" className="text-[10px] whitespace-nowrap ml-2">
                    {new Date(project.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description || "No description provided."}
                </p>
              </CardContent>
              <CardFooter>
                <Link href={`/projects/${project.id}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full">Open →</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
