"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, type TooltipProps } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import type { SalesSummaryReport } from "@/lib/types/report"
import { formatCurrency } from "@/lib/utils/export"

interface SalesTrendChartProps {
  data: SalesSummaryReport[]
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid gap-2">
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
          <span className="font-bold text-muted-foreground">{payload[0].payload.date}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">Revenue</span>
          <span className="font-bold" style={{ color: "hsl(var(--chart-1))" }}>
            {formatCurrency(payload[0].value)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
          <CardDescription>Daily revenue and order volume</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-8">No data available</p>
        </CardContent>
      </Card>
    )
  }

  // Group by date and sum amounts
  const chartData = data.reduce(
    (acc, item) => {
      const date = new Date(item.order_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      const existing = acc.find((d) => d.date === date)
      if (existing) {
        existing.revenue += item.total_sales || 0
        existing.orders += 1
      } else {
        acc.push({
          date,
          revenue: item.total_sales || 0,
          orders: 1,
        })
      }
      return acc
    },
    [] as Array<{ date: string; revenue: number; orders: number }>,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Trend</CardTitle>
        <CardDescription>Daily revenue and order volume</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            revenue: {
              label: "Revenue (ETB)",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
