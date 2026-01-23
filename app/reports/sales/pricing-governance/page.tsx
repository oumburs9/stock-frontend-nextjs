"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useState } from "react"
import { Tag, Percent, TrendingDown, CheckCircle } from "lucide-react"
import { ReportPageLayout } from "@/components/reports/report-page-layout"
import { KpiCard } from "@/components/reports/kpi-card"
import { EmptyState } from "@/components/reports/empty-state"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePricingGovernanceReport } from "@/lib/hooks/use-reports"
import { formatPercentage, formatNumber } from "@/lib/utils/export"
import type { PricingGovernanceFilters } from "@/lib/types/report"

export default function PricingGovernancePage() {
  const [filters, setFilters] = useState<PricingGovernanceFilters>({})
  const { data, isLoading, refetch } = usePricingGovernanceReport(filters)

  const report = data?.[0]
  const totalItems = report?.total_items || 0
  const ruleUsedCount = report?.rule_used_count || 0
  const discountedItems = report?.discounted_items || 0
  const avgDiscountPercent = Number.parseFloat(report?.avg_discount_percent || "0")

  return (
    <DashboardLayout>
      <ReportPageLayout
        title="Pricing Governance Report"
        description="Monitor pricing rules, discounts and margins across the system"
        filters={null}
        actions={null}
        kpis={
          <>
            <KpiCard title="Total Items" value={formatNumber(totalItems)} icon={Tag} />
            <KpiCard title="Rule Used Count" value={formatNumber(ruleUsedCount)} icon={CheckCircle} />
            <KpiCard title="Discounted Items" value={formatNumber(discountedItems)} icon={TrendingDown} />
            <KpiCard title="Avg Discount" value={formatPercentage(avgDiscountPercent)} icon={Percent} />
          </>
        }
        onRefresh={() => refetch()}
        isRefreshing={isLoading}
      >
        {report ? (
          <Card>
            <CardHeader>
              <CardTitle>Pricing Governance Summary</CardTitle>
              <CardDescription>Overall pricing metrics and discount governance</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Items in System</p>
                <p className="text-2xl font-bold">{formatNumber(totalItems)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Items with Pricing Rules</p>
                <p className="text-2xl font-bold">{formatNumber(ruleUsedCount)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Items with Discounts Applied</p>
                <p className="text-2xl font-bold">{formatNumber(discountedItems)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Average Discount Percentage</p>
                <p className="text-2xl font-bold">{formatPercentage(avgDiscountPercent)}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            title="No pricing data available"
            description="No pricing governance information available at this time"
          />
        )}
      </ReportPageLayout>
    </DashboardLayout>
  )
}
