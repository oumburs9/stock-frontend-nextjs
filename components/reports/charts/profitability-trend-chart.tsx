"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import type { ProfitabilityReport } from "@/lib/types/report"

interface ProfitabilityTrendChartProps {
  data: ProfitabilityReport[]
}

export function ProfitabilityTrendChart({ data }: ProfitabilityTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profitability Trends</CardTitle>
          <CardDescription>Revenue, gross profit, and net profit over time</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-8">No data available</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((item) => ({
      period: item.period,
      revenue: item.revenue,
      grossProfit: item.gross_profit,
      netProfit: item.net_profit,
    }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="flex flex-col gap-2">
          <span className="text-[0.70rem] uppercase text-muted-foreground font-bold">{payload[0].payload.period}</span>
          <div className="grid gap-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between gap-4">
                <span className="text-[0.70rem] uppercase text-muted-foreground">{entry.name}</span>
                <span className="font-bold" style={{ color: entry.color }}>
                  ETB {(entry.value || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profitability Trends</CardTitle>
        <CardDescription>Revenue, gross profit, and net profit over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            revenue: {
              label: "Revenue (ETB)",
              color: "hsl(var(--chart-1))",
            },
            grossProfit: {
              label: "Gross Profit (ETB)",
              color: "hsl(var(--chart-2))",
            },
            netProfit: {
              label: "Net Profit (ETB)",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <ChartTooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
              <Line type="monotone" dataKey="grossProfit" stroke="var(--color-grossProfit)" strokeWidth={2} />
              <Line type="monotone" dataKey="netProfit" stroke="var(--color-netProfit)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
