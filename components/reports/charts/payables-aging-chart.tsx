"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils/export"
import type { PayablesReport } from "@/lib/types/report"

interface PayablesAgingChartProps {
  data: PayablesReport[]
}

const CustomPayablesTooltip = (props: any) => {
  const { active, payload } = props

  if (!active || !payload || payload.length === 0) {
    return null
  }

  const data = payload[0]?.payload
  if (!data) return null

  return (
    <div className="rounded-lg border border-border bg-background p-2 shadow-md">
      <p className="text-sm font-medium">{data.range || "N/A"}</p>
      <p className="text-sm text-muted-foreground">Count: {data.count || 0}</p>
      <p className="text-sm text-foreground font-semibold">{formatCurrency(data.amount || 0)}</p>
    </div>
  )
}

export function PayablesAgingChart({ data }: PayablesAgingChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payables Aging Analysis</CardTitle>
          <CardDescription>Outstanding amounts by aging period</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-8">No data available</p>
        </CardContent>
      </Card>
    )
  }

  const agingBuckets = [
    { range: "Current", count: 0, amount: 0 },
    { range: "1-30 Days", count: 0, amount: 0 },
    { range: "31-60 Days", count: 0, amount: 0 },
    { range: "61-90 Days", count: 0, amount: 0 },
    { range: "90+ Days", count: 0, amount: 0 },
  ]

  data.forEach((item) => {
    const overdueDays = item.overdue_days || 0

    let bucket
    if (overdueDays <= 0) bucket = agingBuckets[0]
    else if (overdueDays <= 30) bucket = agingBuckets[1]
    else if (overdueDays <= 60) bucket = agingBuckets[2]
    else if (overdueDays <= 90) bucket = agingBuckets[3]
    else bucket = agingBuckets[4]

    bucket.count++
    bucket.amount += item.balance || 0
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payables Aging Analysis</CardTitle>
        <CardDescription>Outstanding amounts by aging period</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agingBuckets}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip content={<CustomPayablesTooltip />} />
              <Bar dataKey="amount" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
