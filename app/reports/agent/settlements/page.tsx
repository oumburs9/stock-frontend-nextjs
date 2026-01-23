"use client"

import { useState } from "react"
import { Package, DollarSign, CheckCircle, Clock } from "lucide-react"
import { ReportPageLayout } from "@/components/reports/report-page-layout"
import { ReportTable } from "@/components/reports/report-table"
import { DateRangeFilter } from "@/components/reports/date-range-filter"
import { ExportButton } from "@/components/reports/export-button"
import { KpiCard } from "@/components/reports/kpi-card"
import { EmptyState } from "@/components/reports/empty-state"
import { Badge } from "@/components/ui/badge"
import { SettlementStatusChart } from "@/components/reports/charts/settlement-status-chart"
import { useAgentSettlementsReport } from "@/lib/hooks/use-reports"
import { formatCurrency, formatNumber } from "@/lib/utils/export"
import type { AgentSettlementFilters } from "@/lib/types/report"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function AgentSettlementsPage() {
  const [filters, setFilters] = useState<AgentSettlementFilters>({})
  const { data, isLoading, refetch } = useAgentSettlementsReport(filters)

  const totalSettlements = data?.reduce((sum, item) => sum + item.count, 0) || 0
  const totalAmount = data?.reduce((sum, item) => sum + Number.parseFloat(item.total_amount || "0"), 0) || 0
  const draftCount = data?.find((item) => item.status === "draft")?.count || 0
  const invoicedCount = data?.find((item) => item.status === "invoiced")?.count || 0

  const columns = [
    {
      key: "status",
      header: "Status",
      render: (value: string) => <Badge variant="default">{value.toUpperCase()}</Badge>,
    },
    {
      key: "count",
      header: "Count",
      render: (value: number) => formatNumber(value),
    },
    {
      key: "total_amount",
      header: "Total Amount",
      render: (value: string) => formatCurrency(Number.parseFloat(value || "0")),
    },
  ]

  return (
    <DashboardLayout>
      <ReportPageLayout
        title="Agent Settlements Report"
        description="Summary of agent commission settlements by status"
        filters={<DateRangeFilter value={filters} onChange={(range) => setFilters({ ...filters, ...range })} />}
        actions={
          <ExportButton
            reportName="agent-settlements"
            onExport={() => Promise.resolve(new Blob())}
            disabled={!data || data.length === 0}
          />
        }
        kpis={
          <>
            <KpiCard title="Total Settlements" value={formatNumber(totalSettlements)} icon={Package} />
            <KpiCard title="Total Amount" value={formatCurrency(totalAmount)} icon={DollarSign} />
            <KpiCard title="Draft" value={formatNumber(draftCount)} icon={Clock} />
            <KpiCard title="Invoiced" value={formatNumber(invoicedCount)} icon={CheckCircle} />
          </>
        }
        onRefresh={() => refetch()}
        isRefreshing={isLoading}
      >
        {data && data.length > 0 && (
          <div className="mb-6">
            <SettlementStatusChart data={data} />
          </div>
        )}

        {data && data.length > 0 ? (
          <ReportTable data={data} columns={columns} isLoading={isLoading} />
        ) : (
          <EmptyState
            title="No settlement data available"
            description="No agent settlements found for the selected period"
          />
        )}
      </ReportPageLayout>
    </DashboardLayout>
  )
}
