"use client"

import { useState } from "react"
import { ShoppingCart, DollarSign, TrendingUp, Package } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ReportPageLayout } from "@/components/reports/report-page-layout"
import { ReportTable } from "@/components/reports/report-table"
import { DateRangeFilter } from "@/components/reports/date-range-filter"
import { ExportButton } from "@/components/reports/export-button"
import { KpiCard } from "@/components/reports/kpi-card"
import { EmptyState } from "@/components/reports/empty-state"
import { SalesTrendChart } from "@/components/reports/charts/sales-trend-chart"
import { useSalesSummaryReport, useExportSalesSummary } from "@/lib/hooks/use-reports"
import { formatCurrency, formatNumber } from "@/lib/utils/export"
import { formatDateShort } from "@/lib/utils/date"
import type { SalesSummaryFilters } from "@/lib/types/report"

export default function SalesSummaryPage() {
  const [filters, setFilters] = useState<SalesSummaryFilters>({})
  const { data, isLoading, refetch } = useSalesSummaryReport(filters)
  const exportMutation = useExportSalesSummary()

  const totalOrders = data?.reduce((sum, item) => sum + item.orders_count, 0) || 0
  const totalQuantity = data?.reduce((sum, item) => sum + Number.parseFloat(item.total_quantity), 0) || 0
  const totalRevenue = data?.reduce((sum, item) => sum + Number.parseFloat(item.total_sales), 0) || 0
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const columns = [
    {
      key: "order_date",
      header: "Date",
      render: (value: string) => formatDateShort(value),
    },
    { key: "orders_count", header: "Orders", render: (value: number) => formatNumber(value) },
    {
      key: "total_quantity",
      header: "Quantity",
      render: (value: string) => formatNumber(value),
    },
    {
      key: "total_sales",
      header: "Total Sales",
      render: (value: string) => formatCurrency(value),
    },
  ]

  return (
    <DashboardLayout>
      <ReportPageLayout
        title="Sales Summary Report"
        description="Comprehensive overview of sales performance"
        filters={<DateRangeFilter value={filters} onChange={(range) => setFilters({ ...filters, ...range })} />}
        actions={
          <ExportButton
            reportName="sales-summary"
            onExport={(format) => exportMutation.mutateAsync({ filters, format })}
            disabled={!data || data.length === 0}
          />
        }
        kpis={
          <>
            <KpiCard title="Total Orders" value={formatNumber(totalOrders)} icon={ShoppingCart} />
            <KpiCard title="Total Quantity" value={formatNumber(totalQuantity)} icon={Package} />
            <KpiCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} />
            <KpiCard title="Avg Order Value" value={formatCurrency(avgOrderValue)} icon={TrendingUp} />
          </>
        }
        onRefresh={() => refetch()}
        isRefreshing={isLoading}
      >
        {data && data.length > 0 && (
          <div className="mb-6">
            <SalesTrendChart data={data} />
          </div>
        )}

        {data && data.length > 0 ? (
          <ReportTable data={data} columns={columns} isLoading={isLoading} />
        ) : (
          <EmptyState title="No sales data available" description="No sales orders found for the selected period" />
        )}
      </ReportPageLayout>
    </DashboardLayout>
  )
}
