"use client"

import { useState } from "react"
import { ShoppingCart, DollarSign, TrendingUp, Package, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { KpiCard } from "@/components/reports/kpi-card"
import { DateRangeFilter } from "@/components/reports/date-range-filter"
import { SalesTrendChart } from "@/components/reports/charts/sales-trend-chart"
import { useSalesSummaryReport } from "@/lib/hooks/use-reports"
import { formatCurrency, formatNumber } from "@/lib/utils/export"
import type { SalesSummaryFilters } from "@/lib/types/report"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function SalesDashboard() {
  const [filters, setFilters] = useState<SalesSummaryFilters>({})
  const { data } = useSalesSummaryReport(filters)

  const totalOrders = data?.length || 0
  const totalRevenue = data?.reduce((sum, item) => sum + item.total_amount, 0) || 0
  const totalDiscounts = data?.reduce((sum, item) => sum + item.discount_amount, 0) || 0
  const netRevenue = data?.reduce((sum, item) => sum + item.net_amount, 0) || 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
          <p className="text-muted-foreground mt-2">Monitor sales performance and trends</p>
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
          <KpiCard title="Total Orders" value={formatNumber(totalOrders)} icon={ShoppingCart} />
          <KpiCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} />
          <KpiCard title="Total Discounts" value={formatCurrency(totalDiscounts)} icon={Package} />
          <KpiCard title="Net Revenue" value={formatCurrency(netRevenue)} icon={TrendingUp} />
        </div>

        {/* Charts */}
        {data && data.length > 0 && (
          <div className="grid gap-6">
            <SalesTrendChart data={data} />
          </div>
        )}

        {/* Report Links */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Reports</CardTitle>
            <CardDescription>Access in-depth sales reports</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Link href="/reports/sales/summary">
              <Button variant="outline" className="w-full justify-between bg-transparent">
                <span>Sales Summary</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/reports/sales/pricing-governance">
              <Button variant="outline" className="w-full justify-between bg-transparent">
                <span>Pricing Governance</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/reports/sales/fulfillment">
              <Button variant="outline" className="w-full justify-between bg-transparent">
                <span>Fulfillment Status</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
