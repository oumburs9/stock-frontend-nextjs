"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import type { AgentPerformanceReport } from "@/lib/types/report"

interface AgentPerformanceChartProps {
  data: AgentPerformanceReport[]
}

export function AgentPerformanceChart({ data }: AgentPerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Agent Performance</CardTitle>
          <CardDescription>Top 10 agents by total sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No agent performance data available
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort by total sales and take top 10
  const chartData = data
    .filter((item) => item.agent_name && item.agent_name.trim() !== "") // Filter out items without agent_name
    .sort((a, b) => b.total_sales - a.total_sales)
    .slice(0, 10)
    .map((item) => ({
      agent: item.agent_name.split(" ")[0], // Now safe because we filtered
      sales: item.total_sales,
      fullName: item.agent_name,
    }))

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Agent Performance</CardTitle>
          <CardDescription>Top 10 agents by total sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No valid agent performance data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null

    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">Agent</span>
            <span className="font-bold text-muted-foreground">{payload[0].payload.fullName}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">Total Sales</span>
            <span className="font-bold">ETB {payload[0].value.toLocaleString()}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Agent Performance</CardTitle>
        <CardDescription>Top 10 agents by total sales</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            sales: {
              label: "Total Sales",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[300px]"
        >
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <YAxis type="category" dataKey="agent" tickLine={false} axisLine={false} width={80} />
            <ChartTooltip content={<CustomTooltip />} />
            <Bar dataKey="sales" fill="var(--color-sales)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
