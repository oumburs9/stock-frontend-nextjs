"use client"

import { RequirePermission } from "@/components/auth/require-permission"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PurchaseOrderTable } from "@/components/purchase/orders/purchase-order-table"

export default function PurchaseOrdersPage() {
  return (
    <DashboardLayout>
      <RequirePermission permission="purchase-order:view">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
            <p className="text-muted-foreground">Manage your purchase orders and receive inventory</p>
          </div>
          <PurchaseOrderTable />
        </div>
      </RequirePermission>
    </DashboardLayout>
  )
}
