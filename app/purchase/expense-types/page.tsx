"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ExpenseTypeTable } from "@/components/purchase/expense-types/expense-type-table"

export default function ExpenseTypesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expense Types</h1>
          <p className="text-muted-foreground">Manage shipment and batch expense categories</p>
        </div>
        <ExpenseTypeTable />
      </div>
    </DashboardLayout>
  )
}
