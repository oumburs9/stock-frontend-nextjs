"use client"

import Link from "next/link"
import { type LucideIcon, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface DomainCardProps {
  title: string
  description: string
  icon: LucideIcon
  metrics: Array<{
    label: string
    value: string
    trend?: "up" | "down"
  }>
  href: string
}

export function DomainCard({ title, description, icon: Icon, metrics, href }: DomainCardProps) {
  if (!metrics || metrics.length === 0) {
    return null
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-1">
              <p className="text-sm text-muted-foreground">{metric?.label || "N/A"}</p>
              <p className="text-2xl font-bold">{metric?.value || "0"}</p>
            </div>
          ))}
        </div>
        <Link href={href} className="block">
          <Button variant="outline" className="w-full justify-between bg-transparent">
            <span>View Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
