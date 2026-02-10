"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import type { CashflowReport } from "@/lib/types/report"

interface CashflowChartProps {
  data: CashflowReport[]
}

export function CashflowChart({ data }: CashflowChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Analysis</CardTitle>
          <CardDescription>Daily inflows vs outflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No cash flow data available
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group by date and separate inflow/outflow
  const chartData = data.reduce(
    (acc, item) => {
      const date = new Date(item.payment_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      const existing = acc.find((d) => d.date === date)
      const inflow = Number.parseFloat(item.inflow)
      const outflow = Number.parseFloat(item.outflow)

      if (existing) {
        existing.inflow += inflow
        existing.outflow += outflow
      } else {
        acc.push({
          date,
          inflow,
          outflow,
        })
      }
      return acc
    },
    [] as Array<{ date: string; inflow: number; outflow: number }>,
  )

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
            <span className="font-bold text-muted-foreground">{payload[0].payload.date}</span>
          </div>
          <div className="flex justify-between gap-8">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">Inflow</span>
              <span className="font-bold text-green-600">ETB {payload[0]?.value?.toLocaleString() || 0}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">Outflow</span>
              <span className="font-bold text-red-600">ETB {payload[1]?.value?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Analysis</CardTitle>
        <CardDescription>Daily inflows vs outflows</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            inflow: {
              label: "Inflow",
              color: "hsl(var(--chart-2))",
            },
            outflow: {
              label: "Outflow",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip content={<CustomTooltip />} />
            <Bar dataKey="inflow" fill="var(--color-inflow)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outflow" fill="var(--color-outflow)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
