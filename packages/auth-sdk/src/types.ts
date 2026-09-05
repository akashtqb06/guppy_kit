export interface User {
  id: string
  email: string
  is_active: boolean
  is_admin: boolean
  created_at: string
}

export type Permission =
  | "user.view" | "user.create" | "user.update" | "user.delete"
  | "tool.view" | "tool.execute"
  | "project.own" | "project.view"
  | "execution.own" | "execution.view"
  | "admin.panel"

export type RoleName = "superadmin" | "admin" | "tool_manager" | "user" | "viewer"

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  permissions: Permission[]
  roles: RoleName[]
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

