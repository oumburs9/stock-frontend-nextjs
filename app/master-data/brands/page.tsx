"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BrandTable } from "@/components/master-data/brands/brand-table"

export default function BrandsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
          <p className="text-muted-foreground">Manage product brands and manufacturers</p>
        </div>
        <BrandTable />
      </div>
    </DashboardLayout>
  )
}
