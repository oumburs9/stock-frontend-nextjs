import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StockReservationTable } from "@/components/inventory/reservations/stock-reservation-table"
import { RequirePermission } from "@/components/auth/require-permission"

export const metadata = {
  title: "Stock Reservations | Inventory",
  description: "Manage stock reservations for orders",
}

export default function ReservationsPage() {
  return (
    <DashboardLayout>
      <RequirePermission permission="stock.reservation:view">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stock Reservations</h1>
            <p className="text-muted-foreground mt-2">Hold stock for pending sales orders</p>
          </div>
          <StockReservationTable />
        </div>
      </RequirePermission>
    </DashboardLayout>
  )
}
