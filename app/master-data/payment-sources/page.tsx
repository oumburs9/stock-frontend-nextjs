"use client"

import { RequirePermission } from "@/components/auth/require-permission"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PaymentSourceTable } from "@/components/master-data/payment-sources/payment-source-table"

export default function PaymentSourcesPage() {
  return (
    <DashboardLayout>
      <RequirePermission permission="payment-source:view">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Sources</h1>
            <p className="text-muted-foreground">
              Manage bank accounts, cash registers, and mobile wallets used for payments
            </p>
          </div>
          <PaymentSourceTable />
        </div>
      </RequirePermission>
    </DashboardLayout>
  )
}
