"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CategoryTable } from "@/components/master-data/categories/category-table"

export default function CategoriesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage product categories and hierarchies</p>
        </div>
        <CategoryTable />
      </div>
    </DashboardLayout>
  )
}
