"use client"
import * as React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"
import { cn } from "../../lib/utils"
import { Button } from "./button"

const lowlight = createLowlight(common)

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: number
  mode?: "rich" | "code" // rich = full toolbar, code = code-focused
  language?: string // for code mode
}

function ToolbarButton({ onClick, isActive, children, title }: { onClick: () => void; isActive?: boolean; children: React.ReactNode; title: string }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={cn(
        "h-7 w-7 rounded flex items-center justify-center text-xs transition-colors",
        isActive ? "bg-brand text-brand-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

export function RichTextEditor({ value, onChange, placeholder, className, minHeight = 160, mode = "rich", language }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder: placeholder ?? "Start typing..." }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: language ?? "auto" }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getText())
    },
    editorProps: {
      attributes: {
        class: cn(
          "outline-none w-full prose prose-sm dark:prose-invert max-w-none font-mono text-sm",
          `min-h-[${minHeight}px]`
        ),
      },
    },
    immediatelyRender: false,
  })

  // Sync external value changes
  React.useEffect(() => {
    if (editor && editor.getText() !== value) {
      editor.commands.setContent(value || "", { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div className={cn("rounded-lg border border-input bg-background focus-within:ring-1 focus-within:ring-ring overflow-hidden", className)}>
      {mode === "rich" && (
        <div className="flex items-center gap-0.5 border-b border-border px-2 py-1 bg-muted/30">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold">
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic">
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive("code")} title="Inline code">
            {'<>'}
          </ToolbarButton>
          <div className="h-4 w-px bg-border mx-1" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="Heading">
            H2
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Bullet list">
            •—
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Ordered list">
            1.
          </ToolbarButton>
          <div className="h-4 w-px bg-border mx-1" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive("codeBlock")} title="Code block">
            {'{ }'}
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="Quote">
            "
          </ToolbarButton>
        </div>
      )}
      {mode === "code" && (
        <div className="flex items-center gap-2 border-b border-border px-3 py-1 bg-muted/30">
          <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">{language ?? "plaintext"}</span>
          <div className="ml-auto flex items-center gap-0.5">
            <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive("codeBlock")} title="Code block">
              {'{ }'}
            </ToolbarButton>
          </div>
        </div>
      )}
      <div className="px-3 py-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
