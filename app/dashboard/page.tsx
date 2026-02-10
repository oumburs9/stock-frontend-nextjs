"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/hooks/use-auth"
import { useUsers } from "@/lib/hooks/use-users"
import { useRoles } from "@/lib/hooks/use-roles"
import { usePermissions } from "@/lib/hooks/use-permissions"

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: users, isLoading: usersLoading } = useUsers()
  const { data: roles, isLoading: rolesLoading } = useRoles()
  const { data: permissions, isLoading: permsLoading } = usePermissions()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName}!
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Total Users"
            description="Active system users"
            value={users?.length}
            loading={usersLoading}
          />

          <MetricCard
            title="Roles"
            description="Configured roles"
            value={roles?.length}
            loading={rolesLoading}
          />

          <MetricCard
            title="Permissions"
            description="System permissions"
            value={permissions?.length}
            loading={permsLoading}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Current user information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-mono">{user?.email}</span>

              <span className="text-muted-foreground">Roles:</span>
              <span className="font-mono">
                {user?.roles?.join(", ") || "-"}
              </span>

              <span className="text-muted-foreground">Status:</span>
              <span className="font-mono">
                {user?.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}



function MetricCard({
  title,
  description,
  value,
  loading,
}: {
  title: string
  description: string
  value?: number
  loading?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {loading ? "…" : value ?? 0}
        </div>
      </CardContent>
    </Card>
  )
}
