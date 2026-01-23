import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StockAdjustmentTable } from "@/components/inventory/adjustments/stock-adjustment-table"
import { RequirePermission } from "@/components/auth/require-permission"

export const metadata = {
  title: "Stock Adjustments | Inventory",
  description: "Manage stock adjustments and corrections",
}

export default function AdjustmentsPage() {
  return (
    <DashboardLayout>
      <RequirePermission permission="stock.adjustment:view">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Adjustments</h1>
            <p className="text-muted-foreground mt-2">Correct stock levels when discrepancies occur</p>
          </div>
          <StockAdjustmentTable />
        </div>
      </RequirePermission>
    </DashboardLayout>
  )
}
