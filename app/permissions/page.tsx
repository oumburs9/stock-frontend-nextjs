"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PermissionTable } from "@/components/permissions/permission-table"

export default function PermissionsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
          <p className="text-muted-foreground">Manage system permissions and access controls</p>
        </div>
        <PermissionTable />
      </div>
    </DashboardLayout>
  )
}
