"use client"

import { useState } from "react"
import { Users, DollarSign, TrendingUp, Target, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { KpiCard } from "@/components/reports/kpi-card"
import { DateRangeFilter } from "@/components/reports/date-range-filter"
import { AgentPerformanceChart } from "@/components/reports/charts/agent-performance-chart"
import { useAgentPerformanceReport } from "@/lib/hooks/use-reports"
import { formatCurrency, formatNumber } from "@/lib/utils/export"
import type { AgentPerformanceFilters } from "@/lib/types/report"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function AgentDashboard() {
  const [filters, setFilters] = useState<AgentPerformanceFilters>({})
  const { data } = useAgentPerformanceReport(filters)

  const totalAgents = data?.length || 0
  const totalSales = data?.reduce((sum, item) => sum + item.total_sales, 0) || 0
  const totalCommission = data?.reduce((sum, item) => sum + item.total_commission, 0) || 0
  const avgOrderValue = totalSales / (data?.reduce((sum, item) => sum + item.total_orders, 0) || 1)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Dashboard</h1>
          <p className="text-muted-foreground mt-2">Agent performance and commission tracking</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Date Range</CardTitle>
            <CardDescription>Filter dashboard data by date range</CardDescription>
          </CardHeader>
          <CardContent>
            <DateRangeFilter value={filters} onChange={setFilters} />
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Total Agents" value={formatNumber(totalAgents)} icon={Users} />
          <KpiCard title="Total Sales" value={formatCurrency(totalSales)} icon={DollarSign} />
          <KpiCard title="Total Commission" value={formatCurrency(totalCommission)} icon={TrendingUp} />
          <KpiCard title="Avg Order Value" value={formatCurrency(avgOrderValue)} icon={Target} />
        </div>

        {/* Charts */}
        {data && data.length > 0 && (
          <div className="grid gap-6">
            <AgentPerformanceChart data={data} />
          </div>
        )}

        {/* Report Links */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Reports</CardTitle>
            <CardDescription>Access in-depth agent reports</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Link href="/reports/agent/performance">
              <Button variant="outline" className="w-full justify-between bg-transparent">
                <span>Agent Performance</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/reports/agent/settlements">
              <Button variant="outline" className="w-full justify-between bg-transparent">
                <span>Agent Settlements</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
