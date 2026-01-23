import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StockTransferTable } from "@/components/inventory/transfers/stock-transfer-table"
import { RequirePermission } from "@/components/auth/require-permission"

export const metadata = {
  title: "Stock Transfers | Inventory",
  description: "Manage stock transfers between locations",
}

export default function TransfersPage() {
  return (
    <DashboardLayout>
      <RequirePermission permission="stock.transfer:view">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Transfers</h1>
            <p className="text-muted-foreground mt-2">Move stock between warehouses and shops</p>
          </div>
          <StockTransferTable />
        </div>
      </RequirePermission>
    </DashboardLayout>
  )
}
