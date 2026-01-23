"use client"

import { useState } from "react"
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { ReportPageLayout } from "@/components/reports/report-page-layout"
import { ReportTable } from "@/components/reports/report-table"
import { DateRangeFilter } from "@/components/reports/date-range-filter"
import { ExportButton } from "@/components/reports/export-button"
import { KpiCard } from "@/components/reports/kpi-card"
import { EmptyState } from "@/components/reports/empty-state"
import { CashflowChart } from "@/components/reports/charts/cashflow-chart"
import { useCashflowReport, useExportCashflow } from "@/lib/hooks/use-reports"
import { formatCurrency, formatNumber } from "@/lib/utils/export"
import { formatDateShort } from "@/lib/utils/date"
import type { CashflowFilters } from "@/lib/types/report"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function CashflowPage() {
  const [filters, setFilters] = useState<CashflowFilters>({})
  const { data, isLoading, refetch } = useCashflowReport(filters)
  const exportMutation = useExportCashflow()

  const totalTransactions = data?.length || 0
  const totalInflow = data?.reduce((sum, t) => sum + (t.inflow || 0), 0) || 0
  const totalOutflow = data?.reduce((sum, t) => sum + (t.outflow || 0), 0) || 0
  const netCashflow = totalInflow - totalOutflow

  const columns = [
    { key: "transaction_id", header: "Transaction ID" },
    { key: "account_name", header: "Account" },
    {
      key: "transaction_date",
      header: "Date",
      render: (value: string) => formatDateShort(value),
    },
    {
      key: "inflow",
      header: "Inflow",
      render: (value: number) => (
        <span className="text-green-600">{value > 0 ? `+${formatCurrency(value)}` : formatCurrency(0)}</span>
      ),
    },
    {
      key: "outflow",
      header: "Outflow",
      render: (value: number) => (
        <span className="text-red-600">{value > 0 ? `-${formatCurrency(value)}` : formatCurrency(0)}</span>
      ),
    },
    { key: "category", header: "Category" },
    {
      key: "balance_after",
      header: "Balance",
      render: (value: number) => formatCurrency(value),
    },
  ]

  return (
    <DashboardLayout>
      <ReportPageLayout
        title="Cash Flow Report"
        description="Monitor cash inflows and outflows across accounts"
        filters={<DateRangeFilter value={filters} onChange={(range) => setFilters({ ...filters, ...range })} />}
        actions={
          <ExportButton
            reportName="cashflow"
            onExport={(format) => exportMutation.mutateAsync({ filters, format })}
            disabled={!data || data.length === 0}
          />
        }
        kpis={
          <>
            <KpiCard title="Total Transactions" value={formatNumber(totalTransactions)} icon={Wallet} />
            <KpiCard title="Total Inflow" value={formatCurrency(totalInflow)} icon={TrendingUp} />
            <KpiCard title="Total Outflow" value={formatCurrency(totalOutflow)} icon={TrendingDown} />
            <KpiCard title="Net Cashflow" value={formatCurrency(netCashflow)} icon={DollarSign} />
          </>
        }
        onRefresh={() => refetch()}
        isRefreshing={isLoading}
      >
        {data && data.length > 0 && (
          <div className="mb-6">
            <CashflowChart data={data} />
          </div>
        )}

        {data && data.length > 0 ? (
          <ReportTable data={data} columns={columns} isLoading={isLoading} />
        ) : (
          <EmptyState title="No cashflow data available" description="No transactions found for the selected period" />
        )}
      </ReportPageLayout>
    </DashboardLayout>
  )
}
