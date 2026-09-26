"use client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Badge } from "@guppy-kit/ui";
import { User, Shield, Palette, Bell, Key, LogOut } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('theme') ?? 'system';
    return 'system';
  });

  function applyTheme(t: string) {
    setTheme(t);
    if (typeof window === 'undefined') return;
    localStorage.setItem('theme', t);
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (t === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-brand/20 flex items-center justify-center text-xl font-bold text-brand">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {user?.is_admin && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                <Badge variant="outline" className="text-xs">Active</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex gap-2">
              {['light', 'dark', 'system'].map(t => (
                <button
                  key={t}
                  onClick={() => applyTheme(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border capitalize transition-colors ${
                    theme === t
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-muted-foreground hover:border-foreground/40'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-xs text-muted-foreground">Last changed: unknown</p>
            </div>
            <Button variant="outline" size="sm" disabled>Change password</Button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium">Two-factor authentication</p>
              <p className="text-xs text-muted-foreground">Not configured</p>
            </div>
            <Button variant="outline" size="sm" disabled>Enable</Button>
          </div>
        </CardContent>
      </Card>

      {/* API Access */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Key className="h-4 w-4" />
            API Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Use the Guppy Kit REST API or MCP server to access all tools programmatically.
          </p>
          <div className="flex gap-2">
            <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">API Docs</Button>
            </a>
            <a href="http://localhost:8000/mcp" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">MCP Server</Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <LogOut className="h-4 w-4" />
            Sign out
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" size="sm" onClick={logout}>
            Sign out of Guppy Kit
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
