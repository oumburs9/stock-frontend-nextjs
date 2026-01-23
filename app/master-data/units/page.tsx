"use client"

import { RequirePermission } from "@/components/auth/require-permission"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnitTable } from "@/components/master-data/units/unit-table"

export default function UnitsPage() {
  return (
    <DashboardLayout>
      <RequirePermission permission="unit:view">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Units of Measurement</h1>
            <p className="text-muted-foreground">Manage units for product quantities</p>
          </div>
          <UnitTable />
        </div>
      </RequirePermission>
    </DashboardLayout>
  )
}
