import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StockTransactionTable } from "@/components/inventory/stock-transactions/stock-transaction-table"
import { RequirePermission } from "@/components/auth/require-permission"

export const metadata = {
  title: "Stock Transactions | Inventory",
  description: "View full audit log of stock movements",
}

export default function TransactionsPage() {
  return (
    <DashboardLayout>
      <RequirePermission permission="stock.transaction:view">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Transactions</h1>
            <p className="text-muted-foreground mt-2">Full audit log of all stock movements and changes</p>
          </div>
          <StockTransactionTable />
        </div>
      </RequirePermission>
    </DashboardLayout>
  )
}
