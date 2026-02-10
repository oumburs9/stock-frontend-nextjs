"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import type { StockPositionReport } from "@/lib/types/report"

interface StockLevelChartProps {
  data: StockPositionReport[]
}

type StockByLocation = {
  key: string
  label: string
  quantity: number
}

export function StockLevelChart({ data }: StockLevelChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Levels by Location</CardTitle>
          <CardDescription>Current inventory distribution across warehouses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data available</div>
        </CardContent>
      </Card>
    )
  }

  // Group by warehouse_id and sum quantities

  const chartData = data.reduce<StockByLocation[]>((acc, item) => {
    let locationKey: string
    let label: string

    if (item.shop_id) {
      locationKey = `shop:${item.shop_id}`
      label = "Shop"
    } else if (item.warehouse_id) {
      locationKey = `warehouse:${item.warehouse_id}`
      label = "Warehouse"
    } else {
      return acc
    }

    const qty = Number.parseFloat(item.on_hand_qty)
    const existing = acc.find((d) => d.key === locationKey)

    if (existing) {
      existing.quantity += qty
    } else {
      acc.push({
        key: locationKey,
        label,
        quantity: qty,
      })
    }

    return acc
  }, [])


  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Levels by Warehouse</CardTitle>
        <CardDescription>Current inventory distribution across warehouses and shops</CardDescription>
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
            {/* <XAxis dataKey="warehouse" tickLine={false} tickMargin={10} axisLine={false} /> */}
            <XAxis dataKey="label" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                      <div className="flex flex-col">
                        {/* <span className="text-[0.70rem] uppercase text-muted-foreground">Warehouse</span> */}
                        <span className="text-[0.70rem] uppercase text-muted-foreground">Location</span>
                        <span className="font-bold text-muted-foreground">
                          {/* {payload[0]?.payload?.warehouse || "N/A"} */}
                          {payload[0]?.payload?.label || "N/A"}
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
