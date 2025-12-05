"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { RoleTable } from "@/components/roles/role-table"

export default function RolesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">Manage system roles and their permissions</p>
        </div>
        <RoleTable />
      </div>
    </DashboardLayout>
  )
}
