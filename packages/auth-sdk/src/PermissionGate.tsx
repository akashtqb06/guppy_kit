"use client"
import { usePermission, useRole } from "./usePermission"
import type { Permission, RoleName } from "./types"

interface PermissionGateProps {
  permission?: Permission
  role?: RoleName
  fallback?: React.ReactNode
  children: React.ReactNode
}

/**
 * Renders children only if the user has the required permission or role.
 * Renders fallback (default: null) otherwise.
 */
export function PermissionGate({ permission, role, fallback = null, children }: PermissionGateProps) {
  const hasPerm = usePermission(permission ?? ("" as Permission))
  const hasRole = useRole(role ?? ("" as RoleName))

  const allowed = (permission ? hasPerm : true) && (role ? hasRole : true)
  if (!permission && !role) return <>{children}</>
  return allowed ? <>{children}</> : <>{fallback}</>
}

