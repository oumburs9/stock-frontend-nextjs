"use client"

import { RequirePermission } from "@/components/auth/require-permission"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PartnerTable } from "@/components/master-data/partners/partner-table"

export default function PartnersPage() {
  return (
    <DashboardLayout>
      <RequirePermission permission="partner:view">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Partners</h1>
            <p className="text-muted-foreground">Manage suppliers and customers</p>
          </div>
          <PartnerTable />
        </div>
      </RequirePermission>
    </DashboardLayout>
  )
}
