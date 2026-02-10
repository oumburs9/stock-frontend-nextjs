"use client"

import { useState } from "react"
import { Package, TrendingUp, AlertTriangle, Archive } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ReportPageLayout } from "@/components/reports/report-page-layout"
import { ReportTable } from "@/components/reports/report-table"
import { DateRangeFilter } from "@/components/reports/date-range-filter"
import { ExportButton } from "@/components/reports/export-button"
import { KpiCard } from "@/components/reports/kpi-card"
import { EmptyState } from "@/components/reports/empty-state"
import { StockLevelChart } from "@/components/reports/charts/stock-level-chart"
import { InventoryDistributionChart } from "@/components/reports/charts/inventory-distribution-chart"
import { useStockPositionReport, useExportStockPosition } from "@/lib/hooks/use-reports"
import type { StockPositionFilters } from "@/lib/types/report"
import { useShops } from "@/lib/hooks/use-shops"
import { useWarehouses } from "@/lib/hooks/use-warehouses"

export default function StockPositionPage() {
  const [filters, setFilters] = useState<StockPositionFilters>({})
  const { data, isLoading, refetch } = useStockPositionReport(filters)
  const exportMutation = useExportStockPosition()
  const { data: shops } = useShops()
  const { data: warehouses } = useWarehouses()

  const totalProducts = data?.length || 0
  const totalOnHand = data?.reduce((sum, item) => sum + Number.parseFloat(item.on_hand_qty), 0) || 0
  const totalReserved = data?.reduce((sum, item) => sum + Number.parseFloat(item.reserved_qty), 0) || 0
  const lowStockItems = data?.filter((item) => Number.parseFloat(item.available_qty) < 10).length || 0
  const shopMap = new Map(
      (shops ?? []).map((shop) => [shop.id, shop.name])
    )

  const warehouseMap = new Map(
      (warehouses ?? []).map((wh) => [wh.id, wh.name])
    )

  const columns = [
    { key: "product_name", header: "Product Name" },
    {
      key: "location",
      header: "Location",
      render: (_: any, row: any) => {
        if (row.shop_id) {
          return (
            <>
              {shopMap.get(row.shop_id) ?? "Unknown Shop"}
              <span className="ml-2 text-xs text-muted-foreground">(Shop)</span>
            </>
          )
        }

        if (row.warehouse_id) {
          return (
            <>
              {warehouseMap.get(row.warehouse_id) ?? "Unknown Warehouse"}
              <span className="ml-2 text-xs text-muted-foreground">(Warehouse)</span>
            </>
          )
        }

        return "—"
      },
    },

    {
      key: "on_hand_qty",
      header: "On Hand",
      render: (v: string) => Number.parseFloat(v).toFixed(2),
    },
    {
      key: "reserved_qty",
      header: "Reserved",
      render: (v: string) => Number.parseFloat(v).toFixed(2),
    },
    {
      key: "available_qty",
      header: "Available",
      render: (v: string) => {
        const qty = Number.parseFloat(v)
        return (
          <span className={qty < 10 ? "text-red-600 font-semibold" : ""}>
            {qty.toFixed(2)}
          </span>
        )
      },
    },
  ]


  return (
    <DashboardLayout>
      <ReportPageLayout
        title="Stock Position Report"
        description="Current inventory levels across all warehouses and shops"
        filters={<DateRangeFilter value={filters} onChange={(range) => setFilters({ ...filters, ...range })} />}
        actions={
          <ExportButton
            reportName="stock-position"
            onExport={(format) => exportMutation.mutateAsync({ filters, format })}
            disabled={!data || data.length === 0}
          />
        }
        kpis={
          <>
            <KpiCard title="Total Products" value={totalProducts.toString()} icon={Package} />
            <KpiCard title="Total On Hand" value={totalOnHand.toFixed(2)} icon={TrendingUp} />
            <KpiCard title="Total Reserved" value={totalReserved.toFixed(2)} icon={Archive} />
            <KpiCard title="Low Stock Items" value={lowStockItems.toString()} icon={AlertTriangle} trend="warning" />
          </>
        }
        onRefresh={() => refetch()}
        isRefreshing={isLoading}
      >
        {data && data.length > 0 && (
          <div className="space-y-6 mb-6">
            <div className="grid gap-6 md:grid-cols-2">
              <StockLevelChart data={data} />
              <InventoryDistributionChart data={data} shops={shops}  warehouses={warehouses}/>
            </div>
          </div>
        )}

        {data && data.length > 0 ? (
          <ReportTable data={data} columns={columns} isLoading={isLoading} />
        ) : (
          <EmptyState title="No stock data available" description="No inventory data found for the selected filters" />
        )}
      </ReportPageLayout>
    </DashboardLayout>
  )
}
