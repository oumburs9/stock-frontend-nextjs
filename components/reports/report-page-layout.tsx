"use client"

import type { ReactNode } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ReportPageLayoutProps {
  title: string
  description?: string
  filters?: ReactNode
  actions?: ReactNode
  kpis?: ReactNode
  children: ReactNode
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function ReportPageLayout({
  title,
  description,
  filters,
  actions,
  kpis,
  children,
  onRefresh,
  isRefreshing,
}: ReportPageLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground mt-2">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button variant="outline" size="icon" onClick={onRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          )}
          {actions}
        </div>
      </div>

      {/* Filters */}
      {filters && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Customize your report data</CardDescription>
          </CardHeader>
          <CardContent>{filters}</CardContent>
        </Card>
      )}

      {/* KPIs */}
      {kpis && <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{kpis}</div>}

      {/* Main Content */}
      <Card>
        <CardContent className="pt-6">{children}</CardContent>
      </Card>
    </div>
  )
}
