"use client"

import { useState } from "react"
import { Wallet, TrendingUp, TrendingDown, DollarSign, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { KpiCard } from "@/components/reports/kpi-card"
import { DateRangeFilter } from "@/components/reports/date-range-filter"
import { CashflowChart } from "@/components/reports/charts/cashflow-chart"
import { useCashflowReport } from "@/lib/hooks/use-reports"
import { formatCurrency, formatNumber } from "@/lib/utils/export"
import type { CashflowFilters } from "@/lib/types/report"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function FinanceDashboard() {
  const [filters, setFilters] = useState<CashflowFilters>({})
  const { data } = useCashflowReport(filters)

  const totalTransactions = data?.length || 0
  const totalInflow = data?.reduce((sum, t) => sum + (t.inflow || 0), 0) || 0
  const totalOutflow = data?.reduce((sum, t) => sum + (t.outflow || 0), 0) || 0
  const netCashflow = totalInflow - totalOutflow

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>
          <p className="text-muted-foreground mt-2">Financial health and transaction monitoring</p>
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
          <KpiCard title="Total Transactions" value={formatNumber(totalTransactions)} icon={Wallet} />
          <KpiCard title="Total Inflow" value={formatCurrency(totalInflow)} icon={TrendingUp} />
          <KpiCard title="Total Outflow" value={formatCurrency(totalOutflow)} icon={TrendingDown} />
          <KpiCard title="Net Cashflow" value={formatCurrency(netCashflow)} icon={DollarSign} />
        </div>

        {/* Charts */}
        {data && data.length > 0 && (
          <div className="grid gap-6">
            <CashflowChart data={data} />
          </div>
        )}

        {/* Report Links */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Reports</CardTitle>
            <CardDescription>Access in-depth financial reports</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/reports/finance/receivables">
              <Button variant="outline" className="w-full justify-between bg-transparent">
                <span>Receivables</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/reports/finance/payables">
              <Button variant="outline" className="w-full justify-between bg-transparent">
                <span>Payables</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/reports/finance/cashflow">
              <Button variant="outline" className="w-full justify-between bg-transparent">
                <span>Cash Flow</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/reports/finance/profitability">
              <Button variant="outline" className="w-full justify-between bg-transparent">
                <span>Profitability</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
