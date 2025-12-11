import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StockTable } from "@/components/inventory/stocks/stock-table"

export const metadata = {
  title: "Stock Levels | Inventory",
  description: "Monitor stock levels across warehouses and shops",
}

export default function StocksPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Levels</h1>
          <p className="text-muted-foreground mt-2">Monitor product availability across all locations</p>
        </div>
        <StockTable />
      </div>
    </DashboardLayout>
  )
}
