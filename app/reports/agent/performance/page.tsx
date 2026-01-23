"use client"

import { useState } from "react"
import { Users, TrendingUp, DollarSign, Target } from "lucide-react"
import { ReportPageLayout } from "@/components/reports/report-page-layout"
import { ReportTable } from "@/components/reports/report-table"
import { DateRangeFilter } from "@/components/reports/date-range-filter"
import { ExportButton } from "@/components/reports/export-button"
import { KpiCard } from "@/components/reports/kpi-card"
import { EmptyState } from "@/components/reports/empty-state"
import { AgentPerformanceChart } from "@/components/reports/charts/agent-performance-chart"
import { useAgentPerformanceReport, useExportAgentPerformance } from "@/lib/hooks/use-reports"
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils/export"
import type { AgentPerformanceFilters } from "@/lib/types/report"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function AgentPerformancePage() {
  const [filters, setFilters] = useState<AgentPerformanceFilters>({})
  const { data, isLoading, refetch } = useAgentPerformanceReport(filters)
  const exportMutation = useExportAgentPerformance()

  const totalAgents = data?.length || 0
  const totalSales = data?.reduce((sum, item) => sum + item.total_sales, 0) || 0
  const totalOrders = data?.reduce((sum, item) => sum + item.total_orders, 0) || 0
  const totalCommission = data?.reduce((sum, item) => sum + item.commission_earned, 0) || 0

  const columns = [
    { key: "agent_name", header: "Agent Name" },
    { key: "period", header: "Period" },
    {
      key: "total_sales",
      header: "Total Sales",
      render: (value: number) => formatCurrency(value),
    },
    {
      key: "total_orders",
      header: "Orders",
      render: (value: number) => formatNumber(value),
    },
    {
      key: "commission_earned",
      header: "Commission",
      render: (value: number) => formatCurrency(value),
    },
    {
      key: "target_achievement_percentage",
      header: "Target Achievement",
      render: (value: number) => (
        <span className={value >= 100 ? "text-green-600 font-semibold" : value >= 70 ? "" : "text-red-600"}>
          {formatPercentage(value)}
        </span>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <ReportPageLayout
        title="Agent Performance Report"
        description="Track sales agent performance and targets"
        filters={<DateRangeFilter value={filters} onChange={(range) => setFilters({ ...filters, ...range })} />}
        actions={
          <ExportButton
            reportName="agent-performance"
            onExport={(format) => exportMutation.mutateAsync({ filters, format })}
            disabled={!data || data.length === 0}
          />
        }
        kpis={
          <>
            <KpiCard title="Total Agents" value={formatNumber(totalAgents)} icon={Users} />
            <KpiCard title="Total Sales" value={formatCurrency(totalSales)} icon={DollarSign} />
            <KpiCard title="Total Orders" value={formatNumber(totalOrders)} icon={TrendingUp} />
            <KpiCard title="Total Commission" value={formatCurrency(totalCommission)} icon={Target} />
          </>
        }
        onRefresh={() => refetch()}
        isRefreshing={isLoading}
      >
        {data && data.length > 0 && (
          <div className="mb-6">
            <AgentPerformanceChart data={data} />
          </div>
        )}

        {data && data.length > 0 ? (
          <ReportTable data={data} columns={columns} isLoading={isLoading} />
        ) : (
          <EmptyState
            title="No performance data available"
            description="No agent performance data found for the selected period"
          />
        )}
      </ReportPageLayout>
    </DashboardLayout>
  )
}
