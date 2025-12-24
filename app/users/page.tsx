"use client"

import { RequirePermission } from "@/components/auth/require-permission"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UserTable } from "@/components/users/user-table"

export default function UsersPage() {
  return (
    <DashboardLayout>
      {/* <RequirePermission permission="user:view"> */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage system users and their access</p>
        </div>
        <UserTable />
      </div>
      {/* </RequirePermission> */}
    </DashboardLayout>
  )
}
