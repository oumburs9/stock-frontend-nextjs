import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StockSnapshotTable } from "@/components/inventory/stock/stock-snapshot-table"
import { RequirePermission } from "@/components/auth/require-permission"

export const metadata = {
  title: "Stock Snapshot | Inventory",
  description: "View current stock levels across locations",
}

export default function StockSnapshotPage() {
  return (
    <DashboardLayout>
      <RequirePermission permission="stock.snapshot:view">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Snapshot</h1>
            <p className="text-muted-foreground mt-2">View current quantity of each product at each location</p>
          </div>
          <StockSnapshotTable />
        </div>
      </RequirePermission>
    </DashboardLayout>
  )
}
