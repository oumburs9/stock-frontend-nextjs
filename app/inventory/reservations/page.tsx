import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StockReservationTable } from "@/components/inventory/reservations/stock-reservation-table"

export const metadata = {
  title: "Stock Reservations | Inventory",
  description: "Manage stock reservations for orders",
}

export default function ReservationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Reservations</h1>
          <p className="text-muted-foreground mt-2">Hold stock for pending sales orders</p>
        </div>
        <StockReservationTable />
      </div>
    </DashboardLayout>
  )
}
