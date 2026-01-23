"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import type { StockPositionReport } from "@/lib/types/report"

interface StockLevelChartProps {
  data: StockPositionReport[]
}

export function StockLevelChart({ data }: StockLevelChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Levels by Warehouse</CardTitle>
          <CardDescription>Current inventory distribution across warehouses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>
        </CardContent>
      </Card>
    )
  }

  // Group by warehouse_id and sum quantities
  const chartData = data.reduce(
    (acc, item) => {
      const warehouseKey = item.warehouse_id || "Unknown"
      const existing = acc.find((d) => d.warehouse === warehouseKey)
      const qty = Number.parseFloat(item.on_hand_qty)

      if (existing) {
        existing.quantity += qty
      } else {
        acc.push({
          warehouse: warehouseKey,
          quantity: qty,
        })
      }
      return acc
    },
    [] as Array<{ warehouse: string; quantity: number }>,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Levels by Warehouse</CardTitle>
        <CardDescription>Current inventory distribution across warehouses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            quantity: {
              label: "Quantity",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="warehouse" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">Warehouse</span>
                        <span className="font-bold text-muted-foreground">
                          {payload[0]?.payload?.warehouse || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">Quantity</span>
                        <span className="font-bold">{payload[0]?.value?.toLocaleString() || "0"}</span>
                      </div>
                    </div>
                  </div>
                )
              }}
            />
            <Bar dataKey="quantity" fill="var(--color-quantity)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
