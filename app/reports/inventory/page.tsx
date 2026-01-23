"use client"

import { useState } from "react"
import { Package, TrendingUp, AlertTriangle, Archive, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { KpiCard } from "@/components/reports/kpi-card"
import { DateRangeFilter } from "@/components/reports/date-range-filter"
import { StockLevelChart } from "@/components/reports/charts/stock-level-chart"
import { InventoryDistributionChart } from "@/components/reports/charts/inventory-distribution-chart"
import { useStockPositionReport, useInventoryMovementReport } from "@/lib/hooks/use-reports"
import { formatNumber } from "@/lib/utils/export"
import type { StockPositionFilters, InventoryMovementFilters } from "@/lib/types/report"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function InventoryDashboard() {
  const [filters, setFilters] = useState<StockPositionFilters>({})
  const { data: stockData } = useStockPositionReport(filters)
  const { data: movementData } = useInventoryMovementReport(filters as InventoryMovementFilters)

  const totalProducts = stockData?.length || 0
  const totalQuantity = stockData?.reduce((sum, item) => sum + item.current_quantity, 0) || 0
  const lowStockItems = stockData?.filter((item) => item.current_quantity < 10).length || 0
  const totalMovements = movementData?.length || 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Dashboard</h1>
          <p className="text-muted-foreground mt-2">Comprehensive overview of inventory analytics</p>
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
          <KpiCard title="Total Products" value={formatNumber(totalProducts)} icon={Package} />
          <KpiCard title="Total Stock" value={formatNumber(totalQuantity)} icon={TrendingUp} />
          <KpiCard title="Low Stock Items" value={formatNumber(lowStockItems)} icon={AlertTriangle} />
          <KpiCard title="Movements" value={formatNumber(totalMovements)} icon={Archive} />
        </div>

        {/* Charts */}
        {stockData && stockData.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            <StockLevelChart data={stockData} />
            <InventoryDistributionChart data={stockData} />
          </div>
        )}

        {/* Report Links */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Reports</CardTitle>
            <CardDescription>Access in-depth inventory reports</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Link href="/reports/inventory/stock-position">
              <Button variant="outline" className="w-full justify-between bg-transparent">
                <span>Stock Position Report</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/reports/inventory/movement">
              <Button variant="outline" className="w-full justify-between bg-transparent">
                <span>Inventory Movement Report</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
