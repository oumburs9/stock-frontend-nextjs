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

export default function StockPositionPage() {
  const [filters, setFilters] = useState<StockPositionFilters>({})
  const { data, isLoading, refetch } = useStockPositionReport(filters)
  const exportMutation = useExportStockPosition()

  const totalProducts = data?.length || 0
  const totalOnHand = data?.reduce((sum, item) => sum + Number.parseFloat(item.on_hand_qty), 0) || 0
  const totalReserved = data?.reduce((sum, item) => sum + Number.parseFloat(item.reserved_qty), 0) || 0
  const lowStockItems = data?.filter((item) => Number.parseFloat(item.available_qty) < 10).length || 0

  const columns = [
    { key: "product_name", header: "Product Name" },
    {
      key: "warehouse_id",
      header: "Warehouse ID",
      render: (value: string | null) => value || "N/A",
    },
    {
      key: "shop_id",
      header: "Shop ID",
      render: (value: string | null) => value || "N/A",
    },
    {
      key: "on_hand_qty",
      header: "On Hand Qty",
      render: (value: string) => Number.parseFloat(value).toFixed(2),
    },
    {
      key: "reserved_qty",
      header: "Reserved Qty",
      render: (value: string) => Number.parseFloat(value).toFixed(2),
    },
    {
      key: "available_qty",
      header: "Available Qty",
      render: (value: string, row: any) => {
        const qty = Number.parseFloat(value)
        return <span className={qty < 10 ? "text-red-600 font-semibold" : ""}>{qty.toFixed(2)}</span>
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
              <InventoryDistributionChart data={data} />
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
