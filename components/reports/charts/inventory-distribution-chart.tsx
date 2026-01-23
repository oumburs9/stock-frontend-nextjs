"use client"

import { Pie, PieChart, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import type { StockPositionReport } from "@/lib/types/report"

interface InventoryDistributionChartProps {
  data: StockPositionReport[]
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function InventoryDistributionChart({ data }: InventoryDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Distribution</CardTitle>
          <CardDescription>Stock distribution across warehouses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>
        </CardContent>
      </Card>
    )
  }

  // Group by warehouse_id and calculate total available quantity
  const chartData = data.reduce(
    (acc, item) => {
      const warehouseKey = item.warehouse_id || "Unknown"
      const existing = acc.find((d) => d.name === warehouseKey)
      const qty = Number.parseFloat(item.available_qty)

      if (existing) {
        existing.value += qty
      } else {
        acc.push({
          name: warehouseKey,
          value: qty,
        })
      }
      return acc
    },
    [] as Array<{ name: string; value: number }>,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Distribution</CardTitle>
        <CardDescription>Stock distribution across warehouses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartData.reduce(
            (acc, item, index) => ({
              ...acc,
              [item.name]: {
                label: item.name,
                color: COLORS[index % COLORS.length],
              },
            }),
            {},
          )}
          className="h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">Warehouse</span>
                        <span className="font-bold text-muted-foreground">{payload[0]?.name || "N/A"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">Available Qty</span>
                        <span className="font-bold">{payload[0]?.value?.toLocaleString() || "0"}</span>
                      </div>
                    </div>
                  </div>
                )
              }}
            />
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
