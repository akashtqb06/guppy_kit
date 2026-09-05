"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input, Label, Button, Alert, AlertDescription } from "@guppy-kit/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8 lg:hidden flex justify-center">
        {/* Mobile Logo */}
        <div className="h-12 w-12 rounded-xl bg-brand flex items-center justify-center shadow-lg">
          <svg className="w-7 h-7 text-brand-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
          </svg>
        </div>
      </div>

      <div className="mb-8 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in to access your digital workbench.
        </p>
      </div>

      <form id="login-form" onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive" id="login-error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="login-email">Email address</Label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="login-password">Password</Label>
            <Link href="#" className="text-xs text-brand hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="h-11"
          />
          <p className="text-[11px] text-muted-foreground">
            Rate limited after 5 failed attempts.
          </p>
        </div>

        <Button
          id="login-submit"
          type="submit"
          disabled={isLoading}
          className="w-full h-11 text-base font-semibold bg-brand text-brand-foreground hover:bg-brand/90"
        >
          {isLoading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground underline underline-offset-4 hover:text-brand transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
