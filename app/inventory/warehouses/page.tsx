import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { WarehouseTable } from "@/components/inventory/warehouses/warehouse-table"
import { RequirePermission } from "@/components/auth/require-permission"

export const metadata = {
  title: "Warehouses | Inventory",
  description: "Manage warehouse locations",
}

export default function WarehousesPage() {
  return (
    <DashboardLayout>
      <RequirePermission permission="warehouse:view">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Warehouses</h1>
            <p className="text-muted-foreground mt-2">Manage warehouse locations and distribution centers</p>
          </div>
          <WarehouseTable />
        </div>
      </RequirePermission>
    </DashboardLayout>
  )
}
