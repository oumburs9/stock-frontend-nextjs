import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ShopTable } from "@/components/inventory/shops/shop-table"

export const metadata = {
  title: "Shops | Inventory",
  description: "Manage retail shop locations",
}

export default function ShopsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shops</h1>
          <p className="text-muted-foreground mt-2">Manage retail shop locations and branches</p>
        </div>
        <ShopTable />
      </div>
    </DashboardLayout>
  )
}
