"use client"
import * as React from "react"
import { cn } from "../../lib/utils"

export interface FileUploadProps {
  onFiles: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxSizeMb?: number
  label?: string
  className?: string
}

export function FileUpload({ onFiles, accept, multiple, maxSizeMb, label, className }: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFiles(Array.from(e.target.files))
    }
  }

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
        isDragging ? "border-brand bg-brand/5" : "border-border hover:border-brand/50",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        type="file"
        className="hidden"
        ref={inputRef}
        onChange={handleChange}
        multiple={multiple}
        accept={accept}
      />
      <span className="text-sm font-medium">{label || "Click or drag to upload"}</span>
      {maxSizeMb && <span className="text-xs text-muted-foreground mt-1">Max size: {maxSizeMb}MB</span>}
    </div>
  )
}
