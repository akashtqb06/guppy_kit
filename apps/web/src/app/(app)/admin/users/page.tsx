"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge, Button, Separator } from "@guppy-kit/ui";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface AdminUser {
  id: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/users`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.is_admin) {
      fetchUsers();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (!user?.is_admin) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-destructive">403 Forbidden</h2>
        <p className="mt-2 text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    );
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    await fetch(`${API_BASE}/api/v1/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ is_active: !currentStatus }),
    });
    fetchUsers();
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await fetch(`${API_BASE}/api/v1/admin/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchUsers();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight mb-2">User Management</h1>
      <p className="text-sm text-muted-foreground mb-6">Manage user accounts and permissions.</p>
      <Separator className="mb-6" />

      {isLoading ? (
        <div>Loading users...</div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="h-10 px-4 text-left font-medium">Email</th>
                <th className="h-10 px-4 text-left font-medium">Status</th>
                <th className="h-10 px-4 text-left font-medium">Role</th>
                <th className="h-10 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b transition-colors hover:bg-muted/50 last:border-0">
                  <td className="p-4 align-middle">{u.email}</td>
                  <td className="p-4 align-middle">
                    {u.is_active ? (
                      <Badge variant="outline" className="border-brand text-brand">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    {u.is_admin ? (
                      <Badge>Admin</Badge>
                    ) : (
                      <Badge variant="outline">User</Badge>
                    )}
                  </td>
                  <td className="p-4 align-middle text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleActive(u.id, u.is_active)}
                      disabled={u.id === user.id}
                    >
                      {u.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteUser(u.id)}
                      disabled={u.id === user.id}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
