"use client"

import { useState } from "react"
import { PieChart, TrendingUp, DollarSign, Percent } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ReportPageLayout } from "@/components/reports/report-page-layout"
import { DateRangeFilter } from "@/components/reports/date-range-filter"
import { ExportButton } from "@/components/reports/export-button"
import { KpiCard } from "@/components/reports/kpi-card"
import { EmptyState } from "@/components/reports/empty-state"
import { ProfitabilityTrendChart } from "@/components/reports/charts/profitability-trend-chart"
import { useProfitabilityReport, useExportProfitability } from "@/lib/hooks/use-reports"
import { formatCurrency, formatPercentage } from "@/lib/utils/export"
import type { ProfitabilityFilters } from "@/lib/types/report"

export default function ProfitabilityPage() {
  const [filters, setFilters] = useState<ProfitabilityFilters>({})
  const { data, isLoading, refetch } = useProfitabilityReport(filters)
  const exportMutation = useExportProfitability()

  const totalRevenue = data?.[0] ? Number.parseFloat(data[0].revenue) : 0
  const totalCogs = data?.[0] ? Number.parseFloat(data[0].cogs) : 0
  const totalProfit = data?.[0] ? Number.parseFloat(data[0].profit) : 0
  const avgMargin = data?.[0] ? Number.parseFloat(data[0].avg_margin) : 0

  return (
    <DashboardLayout>
      <ReportPageLayout
        title="Profitability Report"
        description="Analyze profit margins and financial performance"
        filters={<DateRangeFilter value={filters} onChange={(range) => setFilters({ ...filters, ...range })} />}
        actions={
          <ExportButton
            reportName="profitability"
            onExport={(format) => exportMutation.mutateAsync({ filters, format })}
            disabled={!data || data.length === 0}
          />
        }
        kpis={
          <>
            <KpiCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} />
            <KpiCard title="Total COGS" value={formatCurrency(totalCogs)} icon={PieChart} />
            <KpiCard title="Net Profit" value={formatCurrency(totalProfit)} icon={TrendingUp} />
            <KpiCard title="Avg Margin" value={formatPercentage(avgMargin)} icon={Percent} />
          </>
        }
        onRefresh={() => refetch()}
        isRefreshing={isLoading}
      >
        {data && data.length > 0 && (
          <div className="mb-6">
            <ProfitabilityTrendChart data={data} />
          </div>
        )}

        {data && data.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Profitability Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Cost of Goods Sold</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCogs)}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Net Profit</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalProfit)}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Profit Margin</p>
                <p className="text-2xl font-bold">{formatPercentage(avgMargin)}</p>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No profitability data available"
            description="No profit data found for the selected period"
          />
        )}
      </ReportPageLayout>
    </DashboardLayout>
  )
}
