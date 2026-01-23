"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useState } from "react"
import { FileText, DollarSign, AlertCircle, CheckCircle } from "lucide-react"
import { ReportPageLayout } from "@/components/reports/report-page-layout"
import { ReportTable } from "@/components/reports/report-table"
import { ExportButton } from "@/components/reports/export-button"
import { KpiCard } from "@/components/reports/kpi-card"
import { EmptyState } from "@/components/reports/empty-state"
import { Badge } from "@/components/ui/badge"
import { ReceivablesAgingChart } from "@/components/reports/charts/receivables-aging-chart"
import { useReceivablesReport, useExportReceivables } from "@/lib/hooks/use-reports"
import { formatCurrency, formatNumber } from "@/lib/utils/export"
import { formatDateShort } from "@/lib/utils/date"
import type { ReceivablesFilters } from "@/lib/types/report"

export default function ReceivablesPage() {
  const [filters, setFilters] = useState<ReceivablesFilters>({})
  const { data, isLoading, refetch } = useReceivablesReport(filters)
  const exportMutation = useExportReceivables()

  const totalInvoices = data?.length || 0
  const totalBalance = data?.reduce((sum, item) => sum + Number.parseFloat(item.balance), 0) || 0
  const overdueCount = data?.filter((item) => item.status === "overdue").length || 0
  const paidCount = data?.filter((item) => item.status === "paid").length || 0

  const columns = [
    { key: "id", header: "Transaction ID" },
    { key: "partner_id", header: "Partner ID" },
    {
      key: "amount",
      header: "Amount",
      render: (value: string) => formatCurrency(Number.parseFloat(value)),
    },
    {
      key: "balance",
      header: "Balance",
      render: (value: string) => {
        const balance = Number.parseFloat(value)
        return <span className={balance > 0 ? "text-orange-600 font-semibold" : ""}>{formatCurrency(balance)}</span>
      },
    },
    {
      key: "due_date",
      header: "Due Date",
      render: (value: string) => formatDateShort(value),
    },
    {
      key: "overdue_days",
      header: "Overdue Days",
      render: (value: number) => <span className={value > 0 ? "text-red-600 font-semibold" : ""}>{value}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (value: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
          open: "secondary",
          partially_paid: "default",
          paid: "default",
          overdue: "destructive",
        }
        return <Badge variant={variants[value] || "default"}>{value.replace("_", " ").toUpperCase()}</Badge>
      },
    },
  ]

  return (
    <DashboardLayout>
      <ReportPageLayout
        title="Accounts Receivable Report"
        description="Monitor outstanding receivables and payment aging"
        filters={null}
        actions={
          <ExportButton
            reportName="accounts-receivable"
            onExport={(format) => exportMutation.mutateAsync({ filters, format })}
            disabled={!data || data.length === 0}
          />
        }
        kpis={
          <>
            <KpiCard title="Total Receivables" value={formatNumber(totalInvoices)} icon={FileText} />
            <KpiCard title="Outstanding Balance" value={formatCurrency(totalBalance)} icon={DollarSign} />
            <KpiCard title="Overdue Items" value={formatNumber(overdueCount)} icon={AlertCircle} />
            <KpiCard title="Paid Items" value={formatNumber(paidCount)} icon={CheckCircle} />
          </>
        }
        onRefresh={() => refetch()}
        isRefreshing={isLoading}
      >
        {data && data.length > 0 && (
          <div className="mb-6">
            <ReceivablesAgingChart data={data} />
          </div>
        )}

        {data && data.length > 0 ? (
          <ReportTable data={data} columns={columns} isLoading={isLoading} />
        ) : (
          <EmptyState title="No receivables data available" description="No receivables found" />
        )}
      </ReportPageLayout>
    </DashboardLayout>
  )
}
