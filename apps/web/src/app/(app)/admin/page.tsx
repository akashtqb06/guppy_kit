import type { Metadata } from "next"
import { AdminDashboard } from "./AdminDashboard"

export const metadata: Metadata = { title: "Admin — User Management" }

export default function AdminPage() {
  return <AdminDashboard />
}

