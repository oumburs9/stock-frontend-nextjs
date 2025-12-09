"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProductTable } from "@/components/master-data/products/product-table"

export default function ProductsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <ProductTable />
      </div>
    </DashboardLayout>
  )
}
