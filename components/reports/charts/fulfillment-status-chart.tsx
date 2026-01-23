"use client"

import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip, type TooltipProps } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import type { FulfillmentReport } from "@/lib/types/report"
import { formatNumber } from "@/lib/utils/export"

interface FulfillmentStatusChartProps {
  data: FulfillmentReport[]
}

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload
  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid gap-2">
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">Status</span>
          <span className="font-bold">{data.status}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">Orders</span>
          <span className="font-bold">{formatNumber(data.count)}</span>
        </div>
      </div>
    </div>
  )
}

export function FulfillmentStatusChart({ data }: FulfillmentStatusChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fulfillment Status Distribution</CardTitle>
          <CardDescription>Order breakdown by fulfillment status</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-8">No data available</p>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((item) => ({
    status: item.status.replace("_", " ").toUpperCase(),
    count: item.order_count,
  }))

  const COLORS = {
    DRAFT: "hsl(var(--chart-3))",
    CONFIRMED: "hsl(var(--chart-4))",
    RESERVED: "hsl(var(--chart-2))",
    "PARTIALLY DELIVERED": "hsl(var(--chart-5))",
    DELIVERED: "hsl(var(--chart-1))",
    CANCELLED: "hsl(var(--destructive))",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fulfillment Status Distribution</CardTitle>
        <CardDescription>Order breakdown by fulfillment status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Orders",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.status}: ${entry.count}`}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.status as keyof typeof COLORS] || "hsl(var(--chart-1))"}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
