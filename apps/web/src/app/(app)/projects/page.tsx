"use client";

import { useEffect, useState } from "react";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, Input, Textarea, Card, CardHeader, CardTitle, CardContent, CardFooter, Badge, DialogTrigger, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@guppy-kit/ui";
import Link from "next/link";
import { FolderOpen, Plus, MoreHorizontal, Trash2, ExternalLink } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

function getRelativeTime(dateString: string) {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const date = new Date(dateString);
  const diffDays = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return rtf.format(diffDays, 'day');
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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <Badge variant="secondary" className="rounded-full">{projects.length}</Badge>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          } />
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
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Description</label>
                  <span className={`text-xs ${newDesc.length > 200 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {newDesc.length}/200
                  </span>
                </div>
                <Textarea 
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)} 
                  placeholder="Brief description of the project"
                  className={newDesc.length > 200 ? 'border-destructive' : ''}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={
                <Button variant="outline">
                  Cancel
                </Button>
              } />
              <Button onClick={handleCreate} disabled={!newName.trim() || isCreating || newDesc.length > 200}>
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
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-1">No projects yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Projects help you organize related tool executions</p>
          <Button onClick={() => setIsOpen(true)}>Create your first project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col hover:border-foreground/20 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg font-bold line-clamp-1" title={project.name}>{project.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    } />
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.description || "No description provided."}
                </p>
                <div className="mt-4 text-xs text-muted-foreground font-medium">
                  Created {getRelativeTime(project.created_at)}
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/projects/${project.id}`} className="w-full">
                  <Button variant="outline" className="w-full justify-between">
                    Open Project
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
