"use client"
import * as React from "react"
import type { AuthState, Permission, RoleName, User } from "./types"

const AuthContext = React.createContext<AuthState | null>(null)

const API_BASE = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")
  : "http://localhost:8000"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [permissions, setPermissions] = React.useState<Permission[]>([])
  const [roles, setRoles] = React.useState<RoleName[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const refresh = React.useCallback(async () => {
    try {
      const [meRes, permsRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/auth/me`, { credentials: "include" }),
        fetch(`${API_BASE}/api/v1/auth/permissions`, { credentials: "include" }),
      ])
      if (meRes.ok) {
        const u = await meRes.json() as User
        setUser(u)
        if (permsRes.ok) {
          const p = await permsRes.json() as { permissions: Permission[]; roles: RoleName[] }
          setPermissions(p.permissions ?? [])
          setRoles(p.roles ?? [])
        }
      } else {
        setUser(null)
        setPermissions([])
        setRoles([])
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => { refresh() }, [refresh])

  const login = React.useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Login failed" }))
      throw new Error(err.detail ?? "Login failed")
    }
    await refresh()
  }, [refresh])

  const logout = React.useCallback(async () => {
    await fetch(`${API_BASE}/api/v1/auth/logout`, { method: "POST", credentials: "include" })
    setUser(null)
    setPermissions([])
    setRoles([])
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, permissions, roles, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

