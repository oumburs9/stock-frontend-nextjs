import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StockTransactionTable } from "@/components/inventory/stock-transactions/stock-transaction-table"

export const metadata = {
  title: "Stock Transactions | Inventory",
  description: "View full audit log of stock movements",
}

export default function TransactionsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Transactions</h1>
          <p className="text-muted-foreground mt-2">Full audit log of all stock movements and changes</p>
        </div>
        <StockTransactionTable />
      </div>
    </DashboardLayout>
  )
}
