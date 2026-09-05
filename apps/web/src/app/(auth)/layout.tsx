import type { Metadata } from "next";
import { Zap, Shield, Link } from "lucide-react";
export const metadata: Metadata = {
  title: "Welcome to Guppy Kit",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-muted border-r border-border relative overflow-hidden">
        {/* Gradient backdrop */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20 bg-brand blur-3xl"
            style={{
              backgroundImage: "radial-gradient(circle, var(--color-brand) 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="h-10 w-10 rounded-xl bg-brand flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-brand-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
              </svg>
            </div>
            <span className="font-bold text-2xl tracking-tight">Guppy Kit</span>
          </div>
        </div>

        <div className="relative z-10 space-y-12">
          <blockquote className="space-y-4">
            <p className="text-4xl font-black leading-tight tracking-tight text-foreground">
              "The workbench for<br />modern builders."
            </p>
          </blockquote>
          
          <div className="space-y-6">
            {[
              { icon: <Zap className="h-5 w-5 text-brand" />, text: "40+ professional tools, always available" },
              { icon: <Shield className="h-5 w-5 text-brand" />, text: "Enterprise-grade security and RBAC" },
              { icon: <Link className="h-5 w-5 text-brand" />, text: "REST API + MCP for every tool" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-4 text-base text-muted-foreground font-medium">
                <div className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center text-lg shadow-sm">
                  {item.icon}
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex justify-between items-center text-sm text-muted-foreground font-medium">
          <p>© {new Date().getFullYear()} Guppy Kit</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex flex-col items-center justify-center p-8 bg-background relative">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
