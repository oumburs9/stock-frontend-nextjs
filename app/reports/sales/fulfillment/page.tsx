"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useState } from "react"
import { Package, CheckCircle, Truck, Clock } from "lucide-react"
import { ReportPageLayout } from "@/components/reports/report-page-layout"
import { ReportTable } from "@/components/reports/report-table"
import { KpiCard } from "@/components/reports/kpi-card"
import { EmptyState } from "@/components/reports/empty-state"
import { Badge } from "@/components/ui/badge"
import { FulfillmentStatusChart } from "@/components/reports/charts/fulfillment-status-chart"
import { useFulfillmentReport } from "@/lib/hooks/use-reports"
import { formatNumber } from "@/lib/utils/export"
import type { FulfillmentFilters } from "@/lib/types/report"

export default function FulfillmentPage() {
  const [filters, setFilters] = useState<FulfillmentFilters>({})
  const { data, isLoading, refetch } = useFulfillmentReport(filters)

  const totalOrders = data?.reduce((sum, item) => sum + item.order_count, 0) || 0
  const deliveredCount = data?.find((item) => item.status === "delivered")?.order_count || 0
  const confirmedCount = data?.find((item) => item.status === "confirmed")?.order_count || 0
  const draftCount = data?.find((item) => item.status === "draft")?.order_count || 0

  const columns = [
    {
      key: "status",
      header: "Order Status",
      render: (value: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
          draft: "secondary",
          confirmed: "default",
          reserved: "default",
          partially_delivered: "default",
          delivered: "default",
          cancelled: "destructive",
        }
        return <Badge variant={variants[value] || "default"}>{value.replace("_", " ").toUpperCase()}</Badge>
      },
    },
    {
      key: "order_count",
      header: "Number of Orders",
      render: (value: number) => <span className="font-semibold">{formatNumber(value)}</span>,
    },
  ]

  return (
    <DashboardLayout>
      <ReportPageLayout
        title="Fulfillment Status Report"
        description="Track order fulfillment status distribution"
        filters={null}
        actions={null}
        kpis={
          <>
            <KpiCard title="Total Orders" value={formatNumber(totalOrders)} icon={Package} />
            <KpiCard title="Draft" value={formatNumber(draftCount)} icon={Clock} />
            <KpiCard title="Confirmed" value={formatNumber(confirmedCount)} icon={CheckCircle} />
            <KpiCard title="Delivered" value={formatNumber(deliveredCount)} icon={Truck} />
          </>
        }
        onRefresh={() => refetch()}
        isRefreshing={isLoading}
      >
        {data && data.length > 0 && (
          <div className="mb-6">
            <FulfillmentStatusChart data={data} />
          </div>
        )}

        {data && data.length > 0 ? (
          <ReportTable data={data} columns={columns} isLoading={isLoading} />
        ) : (
          <EmptyState title="No fulfillment data available" description="No order status data found" />
        )}
      </ReportPageLayout>
    </DashboardLayout>
  )
}
