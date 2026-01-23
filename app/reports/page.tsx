"use client"

import { useState } from "react"
import { FileBarChart, Package, ShoppingCart, DollarSign, Users, TrendingUp, AlertTriangle, Wallet } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "@/components/reports/kpi-card"
import { DateRangeFilter } from "@/components/reports/date-range-filter"
import { DomainCard } from "@/components/reports/domain-card"
import { RevenueOverviewChart } from "@/components/reports/charts/revenue-overview-chart"
import { BusinessMetricsChart } from "@/components/reports/charts/business-metrics-chart"
import { CashflowChart } from "@/components/reports/charts/cashflow-chart"
import { AgentPerformanceChart } from "@/components/reports/charts/agent-performance-chart"
import {
  useStockPositionReport,
  useSalesSummaryReport,
  useCashflowReport,
  useReceivablesReport,
  usePayablesReport,
  useAgentPerformanceReport,
} from "@/lib/hooks/use-reports"
import { formatCurrency, formatNumber } from "@/lib/utils/export"
import type { DateRangeFilters } from "@/lib/types/report"

export default function ReportsPage() {
  const [filters, setFilters] = useState<DateRangeFilters>({})

  // Fetch all domain data
  const { data: stockData } = useStockPositionReport(filters)
  const { data: salesData } = useSalesSummaryReport(filters)
  const { data: cashflowData } = useCashflowReport(filters)
  const { data: receivablesData } = useReceivablesReport(filters)
  const { data: payablesData } = usePayablesReport(filters)
  const { data: agentData } = useAgentPerformanceReport(filters)

  const totalRevenue = salesData?.reduce((sum, item) => sum + Number.parseFloat(item.total_sales), 0) || 0
  const stockValue = stockData?.reduce((sum, item) => sum + Number.parseFloat(item.available_qty) * 50, 0) || 0
  const totalReceivables = receivablesData?.reduce((sum, item) => sum + Number.parseFloat(item.balance), 0) || 0
  const totalPayables = payablesData?.reduce((sum, item) => sum + Number.parseFloat(item.balance), 0) || 0
  const netCashflow = cashflowData?.reduce((sum, t) => sum + Number.parseFloat(t.inflow), 0) || 0
  const overdueReceivables = receivablesData?.filter((item) => item.status === "overdue").length || 0
  const lowStockItems = stockData?.filter((item) => Number.parseFloat(item.available_qty) < 10).length || 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileBarChart className="h-8 w-8" />
            Executive Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive overview of business performance across all departments
          </p>
        </div>

        {/* Date Range Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Date Range</CardTitle>
            <CardDescription>Filter all dashboard data by date range</CardDescription>
          </CardHeader>
          <CardContent>
            <DateRangeFilter value={filters} onChange={setFilters} />
          </CardContent>
        </Card>

        {/* Executive KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} />
          <KpiCard title="Net Cash Flow" value={formatCurrency(netCashflow)} icon={Wallet} trend="up" />
          <KpiCard title="Stock Value" value={formatCurrency(stockValue)} icon={Package} />
          <KpiCard title="Receivables" value={formatCurrency(totalReceivables)} icon={TrendingUp} />
        </div>

        {/* Alert KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Low Stock Items"
            value={formatNumber(lowStockItems)}
            icon={AlertTriangle}
            className="border-orange-200 dark:border-orange-900"
          />
          <KpiCard
            title="Overdue Receivables"
            value={formatNumber(overdueReceivables)}
            icon={TrendingUp}
            className="border-red-200 dark:border-red-900"
          />
          <KpiCard title="Active Agents" value={formatNumber(agentData?.length || 0)} icon={Users} />
          <KpiCard title="Payables" value={formatCurrency(totalPayables)} icon={DollarSign} />
        </div>

        {/* Main Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {salesData && salesData.length > 0 && <RevenueOverviewChart data={salesData} />}
          <BusinessMetricsChart
            salesTotal={totalRevenue}
            inventoryValue={stockValue}
            receivables={totalReceivables}
            payables={totalPayables}
          />
        </div>

        {/* Secondary Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {cashflowData && cashflowData.length > 0 && <CashflowChart data={cashflowData} />}
          {agentData && agentData.length > 0 && <AgentPerformanceChart data={agentData} />}
        </div>

        {/* Domain Cards */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Department Dashboards</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <DomainCard
              title="Inventory Management"
              description="Stock levels and warehouse operations"
              icon={Package}
              metrics={[
                { label: "Total Products", value: formatNumber(stockData?.length || 0) },
                { label: "Stock Value", value: formatCurrency(stockValue) },
                { label: "Low Stock", value: formatNumber(lowStockItems) },
                {
                  label: "Available",
                  value: formatNumber(stockData?.reduce((sum, d) => sum + Number.parseFloat(d.available_qty), 0) || 0),
                },
              ]}
              href="/reports/inventory"
            />

            <DomainCard
              title="Sales Analytics"
              description="Revenue performance and order tracking"
              icon={ShoppingCart}
              metrics={[
                {
                  label: "Total Orders",
                  value: formatNumber(salesData?.reduce((sum, d) => sum + d.orders_count, 0) || 0),
                },
                { label: "Revenue", value: formatCurrency(totalRevenue) },
                {
                  label: "Avg Order",
                  value: formatCurrency(totalRevenue / (salesData?.reduce((sum, d) => sum + d.orders_count, 0) || 1)),
                },
                {
                  label: "Days",
                  value: formatNumber(salesData?.length || 0),
                },
              ]}
              href="/reports/sales"
            />

            <DomainCard
              title="Financial Health"
              description="Cash flow and financial metrics"
              icon={DollarSign}
              metrics={[
                { label: "Net Cash Flow", value: formatCurrency(netCashflow) },
                { label: "Receivables", value: formatCurrency(totalReceivables) },
                { label: "Payables", value: formatCurrency(totalPayables) },
                { label: "Transactions", value: formatNumber(cashflowData?.length || 0) },
              ]}
              href="/reports/finance"
            />

            <DomainCard
              title="Agent Performance"
              description="Sales team tracking and commissions"
              icon={Users}
              metrics={[
                { label: "Active Agents", value: formatNumber(agentData?.length || 0) },
                {
                  label: "Total Sales",
                  value: formatCurrency(agentData?.reduce((sum, a) => sum + Number.parseFloat(a.gross_sales), 0) || 0),
                },
                {
                  label: "Commission",
                  value: formatCurrency(
                    agentData?.reduce((sum, a) => sum + Number.parseFloat(a.commission_earned), 0) || 0,
                  ),
                },
                {
                  label: "Total Count",
                  value: formatNumber(agentData?.reduce((sum, a) => sum + a.sales_count, 0) || 0),
                },
              ]}
              href="/reports/agent"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
