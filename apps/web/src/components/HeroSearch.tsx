"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Badge } from "@guppy-kit/ui";
import { Lock, LogIn } from "lucide-react";
import type { ToolSummary } from "@/lib/api";
import { CategoryIcon } from "@/lib/icons";
import { useAuth } from "@/contexts/AuthContext";

export function HeroSearch({ tools }: { tools: ToolSummary[] }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, isLoading: authLoading } = useAuth();
  const isAuthenticated = !authLoading && Boolean(user);

  const trimmedQuery = query.trim();

  const filteredTools = trimmedQuery === ""
    ? []
    : tools.filter((t) => {
        const lowerQ = trimmedQuery.toLowerCase();
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
        setQuery("");
        inputRef.current?.blur();
      } else if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
        // Clear any "/" that may have slipped into the input after focus
        setTimeout(() => {
          setQuery((prev) => (prev === "/" ? "" : prev));
          if (inputRef.current && inputRef.current.value === "/") {
            inputRef.current.value = "";
          }
        }, 0);
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    // Only open dropdown when there is meaningful text
    setIsOpen(val.trim().length > 0);
  }

  /** Build the href — if not authenticated, route via login with redirect */
  function toolHref(t: ToolSummary): string {
    const dest = `/tools/${t.category}/${t.name}`;
    if (isAuthenticated) return dest;
    return `/login?redirect=${encodeURIComponent(dest)}`;
  }

  return (
    <div className="relative mx-auto max-w-xl" ref={containerRef}>
      <form
        id="hero-search-form"
        className="flex overflow-hidden rounded-xl border border-border bg-card shadow-lg"
        onSubmit={(e) => {
          e.preventDefault();
          if (trimmedQuery.length > 0) setIsOpen(true);
        }}
      >
        <div className="flex-1 relative flex items-center">
          <input
            id="hero-search"
            type="text"
            ref={inputRef}
            placeholder="Search tools… e.g. CSV, JWT, SQL, diagram"
            className="w-full bg-transparent px-5 py-3.5 text-sm outline-none placeholder:text-muted-foreground"
            value={query}
            onChange={handleChange}
            onFocus={() => {
              if (trimmedQuery.length > 0) setIsOpen(true);
            }}
          />
          {query && (
            <button
              type="button"
              className="mr-2 rounded p-1 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
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

      {isOpen && trimmedQuery !== "" && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-border bg-card shadow-lg text-left overflow-hidden">
          {/* Auth notice for unauthenticated users */}
          {!isAuthenticated && (
            <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-3 py-2">
              <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                Sign in to use tools &mdash;{" "}
                <Link href="/login" className="font-medium text-brand hover:underline">
                  Sign in
                </Link>{" "}
                or{" "}
                <Link href="/register" className="font-medium text-brand hover:underline">
                  create an account
                </Link>
              </p>
            </div>
          )}

          {filteredTools.length > 0 ? (
            <div className="flex flex-col p-2 gap-1">
              {filteredTools.map((t) => (
                <Link
                  key={t.name}
                  href={toolHref(t)}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted transition-colors group"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-background transition-colors">
                    <CategoryIcon category={t.category ?? ((t as unknown) as Record<string, unknown>).family as string ?? "utilities"} className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold capitalize truncate">{t.name.replace(/-/g, " ")}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1">{t.description}</span>
                  </div>
                  <div className="ml-auto flex items-center gap-2 shrink-0">
                    <Badge className="capitalize bg-brand/10 text-brand border-brand/20" variant="outline">
                      {t.category}
                    </Badge>
                    {!isAuthenticated && (
                      <LogIn className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No tools found matching &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
