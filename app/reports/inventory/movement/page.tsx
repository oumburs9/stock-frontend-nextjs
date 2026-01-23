"use client"

import { useState } from "react"
import { ArrowUpDown, ArrowUp, ArrowDown, Package } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ReportPageLayout } from "@/components/reports/report-page-layout"
import { ReportTable } from "@/components/reports/report-table"
import { DateRangeFilter } from "@/components/reports/date-range-filter"
import { ExportButton } from "@/components/reports/export-button"
import { KpiCard } from "@/components/reports/kpi-card"
import { EmptyState } from "@/components/reports/empty-state"
import { InventoryMovementChart } from "@/components/reports/charts/inventory-movement-chart"
import { useMovementReport, useExportMovement } from "@/lib/hooks/use-reports"
import { formatNumber } from "@/lib/utils/export"
import { formatDateShort } from "@/lib/utils/date"
import type { MovementFilters } from "@/lib/types/report"

export default function MovementPage() {
  const [filters, setFilters] = useState<MovementFilters>({})
  const { data, isLoading, refetch } = useMovementReport(filters)
  const exportMutation = useExportMovement()

  const totalMovements = data?.length || 0
  const totalQtyIn = data?.reduce((sum, m) => sum + Number.parseFloat(m.qty_in), 0) || 0
  const totalQtyOut = data?.reduce((sum, m) => sum + Number.parseFloat(m.qty_out), 0) || 0
  const netMovement = totalQtyIn - totalQtyOut

  const columns = [
    { key: "product_id", header: "Product ID" },
    {
      key: "movement_date",
      header: "Date",
      render: (value: string) => formatDateShort(value),
    },
    {
      key: "qty_in",
      header: "Qty In",
      render: (value: string) => formatNumber(value),
    },
    {
      key: "qty_out",
      header: "Qty Out",
      render: (value: string) => formatNumber(value),
    },
  ]

  return (
    <DashboardLayout>
      <ReportPageLayout
        title="Inventory Movement Report"
        description="Track inventory movements with inbound and outbound quantities"
        filters={<DateRangeFilter value={filters} onChange={(range) => setFilters({ ...filters, ...range })} />}
        actions={
          <ExportButton
            reportName="inventory-movement"
            onExport={(format) => exportMutation.mutateAsync({ filters, format })}
            disabled={!data || data.length === 0}
          />
        }
        kpis={
          <>
            <KpiCard title="Total Movements" value={formatNumber(totalMovements)} icon={Package} />
            <KpiCard title="Inbound Quantity" value={formatNumber(totalQtyIn)} icon={ArrowUp} />
            <KpiCard title="Outbound Quantity" value={formatNumber(totalQtyOut)} icon={ArrowDown} />
            <KpiCard title="Net Movement" value={formatNumber(netMovement)} icon={ArrowUpDown} />
          </>
        }
        onRefresh={() => refetch()}
        isRefreshing={isLoading}
      >
        {data && data.length > 0 && (
          <div className="mb-6">
            <InventoryMovementChart data={data} />
          </div>
        )}

        {data && data.length > 0 ? (
          <ReportTable data={data} columns={columns} isLoading={isLoading} />
        ) : (
          <EmptyState
            title="No movement data available"
            description="No inventory movements found for the selected period"
          />
        )}
      </ReportPageLayout>
    </DashboardLayout>
  )
}
