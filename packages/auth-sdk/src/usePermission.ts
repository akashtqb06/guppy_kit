import { useAuth } from "./AuthProvider"
import type { Permission, RoleName } from "./types"

/** Returns true if the current user has the given permission. */
export function usePermission(permission: Permission): boolean {
  const { permissions } = useAuth()
  return permissions.includes(permission)
}

/** Returns true if the current user has ALL of the given permissions. */
export function usePermissions(required: Permission[]): boolean {
  const { permissions } = useAuth()
  return required.every(p => permissions.includes(p))
}

/** Returns true if the current user has the given role. */
export function useRole(role: RoleName): boolean {
  const { roles } = useAuth()
  return roles.includes(role)
}

