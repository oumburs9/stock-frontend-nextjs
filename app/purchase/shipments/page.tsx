"use client"

import { RequirePermission } from "@/components/auth/require-permission"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ShipmentTable } from "@/components/purchase/shipments/shipment-table"

export default function ShipmentsPage() {
  return (
    <DashboardLayout>
      <RequirePermission permission="purchase-shipment:view">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shipments (BL)</h1>
            <p className="text-muted-foreground">Manage import and local purchase shipments</p>
          </div>
          <ShipmentTable />
        </div>
      </RequirePermission>
    </DashboardLayout>
  )
}
