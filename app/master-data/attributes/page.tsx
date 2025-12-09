"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AttributeTable } from "@/components/master-data/attributes/attribute-table"

export default function AttributesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Attributes</h1>
          <p className="text-muted-foreground">Manage product attributes like color, size, etc.</p>
        </div>
        <AttributeTable />
      </div>
    </DashboardLayout>
  )
}
