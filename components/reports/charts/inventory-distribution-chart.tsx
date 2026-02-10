"use client"

import { Pie, PieChart, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import type { StockPositionReport } from "@/lib/types/report"

interface InventoryDistributionChartProps {
  data: StockPositionReport[]
  shops: { id: string; name: string }[]
  warehouses: { id: string; name: string }[]
}

type InventoryByLocation = {
  key: string
  label: string
  value: number
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function InventoryDistributionChart({ data, shops =[], warehouses = [] }: InventoryDistributionChartProps) {

 const shopMap = new Map(shops.map(s => [s.id, s.name]))
 const warehouseMap = new Map(warehouses.map(w => [w.id, w.name]))

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Distribution</CardTitle>
          <CardDescription>Stock distribution across warehouses and shops</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>
        </CardContent>
      </Card>
    )
  }

  // Group by warehouse_id and calculate total available quantity

   const chartData = data.reduce<InventoryByLocation[]>((acc, item) => {
      let key: string
      let label: string

      if (item.shop_id) {
        key = `shop:${item.shop_id}`
        label = shopMap.get(item.shop_id) ?? "Unknown Shop"
      } else if (item.warehouse_id) {
        key = `warehouse:${item.warehouse_id}`
        label = warehouseMap.get(item.warehouse_id) ?? "Unknown Warehouse"
      } else {
        return acc
      }

      const qty = Number.parseFloat(item.available_qty)
      const existing = acc.find(d => d.key === key)

      if (existing) {
        existing.value += qty
      } else {
        acc.push({ key, label, value: qty })
      }

      return acc
    }, [])


  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventory Distribution</CardTitle>
        <CardDescription>Stock distribution across warehouses and shops</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
         config={chartData.reduce(
          (acc, item, index) => ({
            ...acc,
            [item.key]: {
              label: item.label,
              color: COLORS[index % COLORS.length],
            },
          }),
          {} as Record<string, { label: string; color: string }>,
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
                        {/* <span className="text-[0.70rem] uppercase text-muted-foreground">Warehouse</span>
                        <span className="font-bold text-muted-foreground">{payload[0]?.name || "N/A"}</span> */}
                        <span className="text-[0.70rem] uppercase text-muted-foreground">Location</span>
                        <span className="font-bold text-muted-foreground">{payload[0]?.payload?.label || "N/A"}</span>
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
            <Pie data={chartData} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={100} label>
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
