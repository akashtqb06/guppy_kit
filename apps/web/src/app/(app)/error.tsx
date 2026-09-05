"use client";
import { Button } from "@guppy-kit/ui";
import { AlertCircle } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
