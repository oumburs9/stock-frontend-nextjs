"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { PricingGovernanceReport } from "@/lib/types/report"

interface PricingDistributionChartProps {
  data: PricingGovernanceReport[]
}

export function PricingDistributionChart({ data }: PricingDistributionChartProps) {
  const marginRanges = [
    { range: "0-10%", min: 0, max: 10, count: 0 },
    { range: "10-20%", min: 10, max: 20, count: 0 },
    { range: "20-30%", min: 20, max: 30, count: 0 },
    { range: "30-40%", min: 30, max: 40, count: 0 },
    { range: "40%+", min: 40, max: 100, count: 0 },
  ]

  data.forEach((item) => {
    const margin = item.margin_percentage
    const range = marginRanges.find((r) => margin >= r.min && margin < r.max)
    if (range) range.count++
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Margin Distribution</CardTitle>
        <CardDescription>Number of products by profit margin range</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Products",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={marginRanges}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
