import Link from "next/link";
import { Button } from "@guppy-kit/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md px-4">
        <div className="space-y-2">
          <p className="text-8xl font-black text-muted-foreground/20">404</p>
          <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
          <p className="text-muted-foreground">
            This page doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button nativeButton={false} render={<Link href="/dashboard" />} className="w-full sm:w-auto bg-brand text-brand-foreground hover:bg-brand/90">
            Go to Dashboard
          </Button>
          <Button nativeButton={false} variant="outline" render={<Link href="/" />} className="w-full sm:w-auto">
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
