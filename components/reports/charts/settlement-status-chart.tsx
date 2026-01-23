"use client"

import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import type { AgentSettlementReport } from "@/lib/types/report"

interface SettlementStatusChartProps {
  data: AgentSettlementReport[]
}

export function SettlementStatusChart({ data }: SettlementStatusChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Settlement Status</CardTitle>
          <CardDescription>Commission amounts by settlement status</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-8">No data available</p>
        </CardContent>
      </Card>
    )
  }

  const statusData = data.reduce(
    (acc, item) => {
      if (item.status === "pending") {
        acc.pending += item.commission_amount || 0
      } else {
        acc.settled += item.commission_amount || 0
      }
      return acc
    },
    { pending: 0, settled: 0 },
  )

  const chartData = [
    { status: "Pending", amount: statusData.pending },
    { status: "Settled", amount: statusData.settled },
  ]

  const COLORS = {
    Pending: "hsl(var(--chart-3))",
    Settled: "hsl(var(--chart-1))",
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null

    const entry = payload[0]

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="flex flex-col gap-1">
          <span className="text-[0.70rem] uppercase text-muted-foreground">{entry.payload.status}</span>
          <span className="font-bold">ETB {(entry.value || 0).toLocaleString()}</span>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settlement Status</CardTitle>
        <CardDescription>Commission amounts by settlement status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            Pending: {
              label: "Pending (ETB)",
              color: "hsl(var(--chart-3))",
            },
            Settled: {
              label: "Settled (ETB)",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="amount" nameKey="status" cx="50%" cy="50%" outerRadius={100} label>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS]} />
                ))}
              </Pie>
              <ChartTooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
