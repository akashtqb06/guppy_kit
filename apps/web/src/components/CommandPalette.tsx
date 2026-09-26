"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@guppy-kit/ui"
import { LayoutDashboard, Wrench, FolderClosed, History, Package2, ArrowRight } from "lucide-react"

export interface Tool {
  name: string
  category: string
  description: string
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tools?: Tool[]
}

export function CommandPalette({ open, onOpenChange, tools = [] }: CommandPaletteProps) {
  const router = useRouter()
  const [search, setSearch] = React.useState("")

  const navigate = (path: string) => {
    router.push(path)
    onOpenChange(false)
    setSearch("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl max-w-xl" showCloseButton={false}>
        <DialogTitle className="sr-only">Command Palette</DialogTitle>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3">
            <Wrench className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search tools and pages..."
              className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            <kbd className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">ESC</kbd>
          </div>
          <Command.List className="max-h-96 overflow-y-auto overflow-x-hidden p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found for &quot;{search}&quot;
            </Command.Empty>

            <Command.Group heading="Navigation">
              {[{ label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }, { label: "All Tools", path: "/tools", icon: Wrench }, { label: "Projects", path: "/projects", icon: FolderClosed }, { label: "History", path: "/history", icon: History }].map(item => (
                <Command.Item
                  key={item.path}
                  value={item.label}
                  onSelect={() => navigate(item.path)}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  {item.label}
                  <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground opacity-0 aria-selected:opacity-100" />
                </Command.Item>
              ))}
            </Command.Group>

            {tools.length > 0 && (
              <Command.Group heading="Tools">
                {tools.slice(0, 20).map(tool => (
                  <Command.Item
                    key={tool.name}
                    value={`${tool.name} ${tool.category} ${tool.description}`}
                    onSelect={() => navigate(`/tools/${tool.category}/${tool.name}`)}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                  >
                    <Package2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <span className="capitalize">{tool.name.replace(/-/g, ' ')}</span>
                      <span className="ml-2 text-xs text-muted-foreground capitalize">{tool.category}</span>
                    </div>
                    <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground opacity-0 aria-selected:opacity-100" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
          <div className="border-t px-3 py-2 flex items-center gap-3 text-[10px] text-muted-foreground">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> select</span>
            <span><kbd className="font-mono">esc</kbd> close</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
