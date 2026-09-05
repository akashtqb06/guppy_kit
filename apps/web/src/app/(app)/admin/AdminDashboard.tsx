"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription,
  Badge, Button, Input,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogTitle, DialogDescription,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@guppy-kit/ui"
import { Users, Shield, Activity, Trash2, UserCheck, UserX, Plus } from "lucide-react"
import { toast } from "sonner"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

interface AdminUser {
  id: string
  email: string
  is_active: boolean
  is_admin: boolean
  created_at: string
  roles: string[]
}

interface AuditEvent {
  id: string
  email: string
  ip: string
  success: boolean
  failure_reason: string | null
  created_at: string
}

interface Role {
  name: string
  description: string
  permissions: string[]
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function AdminDashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [assigningRole, setAssigningRole] = useState<{ user: AdminUser; role: string } | null>(null)

  const fetchAll = async () => {
    try {
      const [usersRes, rolesRes, auditRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/admin/users`, { credentials: "include" }),
        fetch(`${API_BASE}/api/v1/admin/roles`, { credentials: "include" }),
        fetch(`${API_BASE}/api/v1/admin/audit-log?limit=50`, { credentials: "include" }),
      ])
      if (!usersRes.ok) { router.push("/dashboard"); return }
      setUsers(await usersRes.json())
      if (rolesRes.ok) setRoles(await rolesRes.json())
      if (auditRes.ok) setAuditLog(await auditRes.json())
    } catch {
      toast.error("Failed to load admin data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const toggleActive = async (user: AdminUser) => {
    const res = await fetch(`${API_BASE}/api/v1/admin/users/${user.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !user.is_active }),
    })
    if (res.ok) {
      toast.success(`User ${user.is_active ? "deactivated" : "activated"}`)
      fetchAll()
    } else {
      toast.error("Failed to update user")
    }
  }

  const deleteUser = async (user: AdminUser) => {
    const res = await fetch(`${API_BASE}/api/v1/admin/users/${user.id}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (res.ok) {
      toast.success(`User ${user.email} deleted`)
      setDeleteTarget(null)
      fetchAll()
    } else {
      const err = await res.json().catch(() => ({}))
      toast.error(err.detail ?? "Failed to delete user")
    }
  }

  const assignRole = async (userId: string, roleName: string) => {
    const res = await fetch(`${API_BASE}/api/v1/admin/users/${userId}/roles/${roleName}`, {
      method: "POST",
      credentials: "include",
    })
    if (res.ok) {
      toast.success(`Role '${roleName}' assigned`)
      setAssigningRole(null)
      fetchAll()
    } else {
      toast.error("Failed to assign role")
    }
  }

  const removeRole = async (userId: string, roleName: string) => {
    const res = await fetch(`${API_BASE}/api/v1/admin/users/${userId}/roles/${roleName}`, {
      method: "DELETE",
      credentials: "include",
    })
    if (res.ok) {
      toast.success(`Role '${roleName}' removed`)
      fetchAll()
    }
  }

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Loading...</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} users · {roles.length} roles</p>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <Shield className="h-3.5 w-3.5" />
          Admin
        </Badge>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="h-9 w-9 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-muted-foreground">Total users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.filter(u => u.is_active).length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-4">
            <div className="h-9 w-9 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <p className="text-2xl font-bold">{auditLog.filter(e => !e.success).length}</p>
              <p className="text-xs text-muted-foreground">Failed logins (recent)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users"><Users className="h-3.5 w-3.5 mr-1.5" />Users</TabsTrigger>
          <TabsTrigger value="roles"><Shield className="h-3.5 w-3.5 mr-1.5" />Roles</TabsTrigger>
          <TabsTrigger value="audit"><Activity className="h-3.5 w-3.5 mr-1.5" />Audit Log</TabsTrigger>
        </TabsList>

        {/* Users tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search by email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.email}
                      {user.is_admin && <Badge variant="secondary" className="ml-2 text-[10px]">admin</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "destructive"} className="text-[10px]">
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map(role => (
                          <button
                            key={role}
                            onClick={() => removeRole(user.id, role)}
                            className="text-[10px] bg-brand/10 text-brand px-1.5 py-0.5 rounded hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Click to remove"
                          >
                            {role} ×
                          </button>
                        ))}
                        <button
                          onClick={() => setAssigningRole({ user, role: "" })}
                          className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded hover:bg-muted/80 transition-colors"
                        >
                          + role
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {timeAgo(user.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(user)}
                          title={user.is_active ? "Deactivate" : "Activate"}
                        >
                          {user.is_active ? <UserX className="h-4 w-4 text-amber-500" /> : <UserCheck className="h-4 w-4 text-emerald-500" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(user)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Roles tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roles.map(role => (
              <Card key={role.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm capitalize">{role.name}</CardTitle>
                    <Badge variant="outline" className="text-[10px]">{role.permissions.length} perms</Badge>
                  </div>
                  <CardDescription className="text-xs">{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map(p => (
                      <span key={p} className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">{p}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Audit log tab */}
        <TabsContent value="audit">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLog.map(event => (
                  <TableRow key={event.id}>
                    <TableCell className="text-sm font-mono">{event.email}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{event.ip}</TableCell>
                    <TableCell>
                      <Badge variant={event.success ? "default" : "destructive"} className="text-[10px]">
                        {event.success ? "✓ Success" : "✗ Failed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{event.failure_reason ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{timeAgo(event.created_at)}</TableCell>
                  </TableRow>
                ))}
                {auditLog.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No login events yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete <strong>{deleteTarget?.email}</strong>? This cannot be undone.
          </DialogDescription>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteTarget && deleteUser(deleteTarget)}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role assignment dialog */}
      <Dialog open={!!assigningRole} onOpenChange={() => setAssigningRole(null)}>
        <DialogContent>
          <DialogTitle>Assign Role</DialogTitle>
          <DialogDescription>Select a role to assign to {assigningRole?.user.email}</DialogDescription>
          <div className="space-y-4 mt-2">
            <Select onValueChange={(value: string | null) => setAssigningRole(a => a ? { ...a, role: value ?? "" } : null)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setAssigningRole(null)}>Cancel</Button>
              <Button
                onClick={() => assigningRole?.role && assignRole(assigningRole.user.id, assigningRole.role)}
                disabled={!assigningRole?.role}
              >
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
