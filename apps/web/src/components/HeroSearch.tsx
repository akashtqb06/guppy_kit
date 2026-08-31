"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button, Badge, Input } from "@guppy-kit/ui";
import type { ToolSummary } from "@/lib/api";

export function HeroSearch({ tools }: { tools: ToolSummary[] }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTools = query.trim() === ""
    ? []
    : tools.filter((t) => {
        const lowerQ = query.toLowerCase();
        return (
          t.name.toLowerCase().includes(lowerQ) ||
          t.description.toLowerCase().includes(lowerQ) ||
          t.category.toLowerCase().includes(lowerQ)
        );
      }).slice(0, 6);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      } else if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    }
    
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative mx-auto max-w-xl" ref={containerRef}>
      <form
        id="hero-search-form"
        className="flex overflow-hidden rounded-xl border border-border bg-card shadow-lg"
        onSubmit={(e) => { e.preventDefault(); setIsOpen(true); }}
      >
        <div className="flex-1 relative flex items-center">
          <input
            id="hero-search"
            type="search"
            ref={inputRef}
            placeholder="Search tools… e.g. CSV, JWT, SQL, diagram"
            className="w-full bg-transparent px-5 py-3.5 text-sm outline-none placeholder:text-muted-foreground"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
        </div>
        <button
          type="submit"
          id="hero-search-btn"
          className="m-1.5 rounded-lg px-5 py-2 text-sm font-semibold bg-brand text-brand-foreground"
        >
          Search
        </button>
      </form>
      <div className="text-center mt-2 text-xs text-muted-foreground">
        <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">Press / to search</kbd>
      </div>

      {isOpen && query.trim() !== "" && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-border bg-card shadow-lg p-2 text-left">
          {filteredTools.length > 0 ? (
            <div className="flex flex-col gap-1">
              {filteredTools.map((t) => (
                <Link
                  key={t.name}
                  href={`/tools/${t.category}/${t.name}`}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-xl">{t.icon || "🛠️"}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold capitalize">{t.name.replace(/-/g, " ")}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">{t.description}</span>
                  </div>
                  <Badge className="ml-auto capitalize bg-brand text-brand-foreground" variant="secondary">{t.category}</Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No tools found matching "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
