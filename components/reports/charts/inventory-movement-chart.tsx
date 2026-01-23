"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import type { MovementReport } from "@/lib/types/report"

interface InventoryMovementChartProps {
  data: MovementReport[]
}

export function InventoryMovementChart({ data }: InventoryMovementChartProps) {
  const chartData = data.reduce(
    (acc, item) => {
      const date = new Date(item.moved_at).toLocaleDateString()
      const existing = acc.find((d) => d.date === date)

      if (existing) {
        if (item.movement_type === "in") existing.inbound += item.quantity
        else if (item.movement_type === "out") existing.outbound += item.quantity
        else existing.adjustment += item.quantity
      } else {
        acc.push({
          date,
          inbound: item.movement_type === "in" ? item.quantity : 0,
          outbound: item.movement_type === "out" ? item.quantity : 0,
          adjustment: item.movement_type === "adjustment" ? item.quantity : 0,
        })
      }
      return acc
    },
    [] as { date: string; inbound: number; outbound: number; adjustment: number }[],
  )

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
            <span className="font-bold text-muted-foreground">{label}</span>
          </div>
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm capitalize">{item.dataKey}:</span>
              <span className="font-bold">{item.value?.toLocaleString() || 0}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Movement Trends</CardTitle>
          <CardDescription>Inbound, outbound, and adjustment quantities over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No movement data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movement Trends</CardTitle>
        <CardDescription>Inbound, outbound, and adjustment quantities over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            inbound: {
              label: "Inbound",
              color: "hsl(var(--chart-1))",
            },
            outbound: {
              label: "Outbound",
              color: "hsl(var(--chart-2))",
            },
            adjustment: {
              label: "Adjustment",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="inbound" fill="var(--color-inbound)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outbound" fill="var(--color-outbound)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="adjustment" fill="var(--color-adjustment)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
