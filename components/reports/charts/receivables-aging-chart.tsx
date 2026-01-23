"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import type { ReceivablesReport } from "@/lib/types/report"

interface ReceivablesAgingChartProps {
  data: ReceivablesReport[]
}

export function ReceivablesAgingChart({ data }: ReceivablesAgingChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Receivables Aging Analysis</CardTitle>
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null

    const data = payload[0].payload
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">{data.range}</span>
            <span className="font-bold text-muted-foreground">
              ETB {data.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-muted-foreground">{data.count} items</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receivables Aging Analysis</CardTitle>
        <CardDescription>Outstanding amounts by aging period</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            amount: {
              label: "Amount (ETB)",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agingBuckets}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <ChartTooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
