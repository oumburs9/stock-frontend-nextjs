"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AttributeSetTable } from "@/components/master-data/attribute-sets/attribute-set-table"

export default function AttributeSetsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attribute Sets</h1>
          <p className="text-muted-foreground">Manage attribute sets for product categories</p>
        </div>
        <AttributeSetTable />
      </div>
    </DashboardLayout>
  )
}
