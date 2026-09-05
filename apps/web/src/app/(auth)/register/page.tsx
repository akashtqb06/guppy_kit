"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input, Label, Button, Alert, AlertDescription } from "@guppy-kit/ui";

function PasswordStrength({ password }: { password: string }) {
  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const labels = ["", "Weak", "Fair", "Strong"];
  const colors = ["", "bg-destructive", "bg-amber-500", "bg-emerald-500"];
  if (!password) return null;
  return (
    <div className="space-y-1 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
            i <= strength ? colors[strength] : "bg-muted"
          }`} />
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground font-medium">{labels[strength]}</p>
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setIsLoading(true);
    try {
      await register(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
        <h1 className="text-3xl font-bold tracking-tight mb-2">Create account</h1>
        <p className="text-muted-foreground">
          Join Guppy Kit and start building.
        </p>
      </div>

      <form id="register-form" onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <Alert variant="destructive" id="register-error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="register-email">Email address</Label>
          <Input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="••••••••"
            className="h-11"
          />
          <PasswordStrength password={password} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-confirm">Confirm password</Label>
          <Input
            id="register-confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            placeholder="••••••••"
            className="h-11"
          />
        </div>

        <Button
          id="register-submit"
          type="submit"
          disabled={isLoading}
          className="w-full h-11 text-base font-semibold bg-brand text-brand-foreground hover:bg-brand/90 mt-2"
        >
          {isLoading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4 hover:text-brand transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
