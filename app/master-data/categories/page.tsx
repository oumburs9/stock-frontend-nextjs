"use client"

import { RequirePermission } from "@/components/auth/require-permission"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CategoryTable } from "@/components/master-data/categories/category-table"

export default function CategoriesPage() {
  return (
    <DashboardLayout>
       <RequirePermission permission="category:view">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">Manage product categories and hierarchies</p>
          </div>
          <CategoryTable />
        </div>
      </RequirePermission>
    </DashboardLayout>
  )
}
