"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"

interface BusinessMetricsChartProps {
  salesTotal: number
  inventoryValue: number
  receivables: number
  payables: number
}

export function BusinessMetricsChart({ salesTotal, inventoryValue, receivables, payables }: BusinessMetricsChartProps) {
  const chartData = [
    {
      category: "Sales",
      value: salesTotal,
    },
    {
      category: "Inventory",
      value: inventoryValue,
    },
    {
      category: "Receivables",
      value: receivables,
    },
    {
      category: "Payables",
      value: payables,
    },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">Category</span>
            <span className="font-bold text-muted-foreground">{payload[0].payload.category}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">Amount</span>
            <span className="font-bold">ETB {payload[0].value.toLocaleString()}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Metrics Overview</CardTitle>
        <CardDescription>Key financial indicators across all departments</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            value: {
              label: "Amount (ETB)",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[350px]"
        >
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="category" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="var(--color-value)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
