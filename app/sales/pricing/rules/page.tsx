"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PricingRulesTable } from "@/components/sales/pricing/pricing-rules-table"
import { PricingRuleFormDialog } from "@/components/sales/pricing/pricing-rule-form-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { RequirePermission } from "@/components/auth/require-permission"
import { useAuth } from "@/lib/hooks/use-auth"

export default function PricingRulesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { hasPermission } = useAuth()

  return (
    <DashboardLayout>
      <RequirePermission permission="pricing-rule:view">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pricing Rules</h1>
            <p className="text-muted-foreground">Manage pricing strategies and margins</p>
          </div>
          {hasPermission("pricing-rule:create") && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Pricing Rule
            </Button>)}
        </div>

        {/* Table */}
        <PricingRulesTable />

        {/* Create Dialog */}
        <PricingRuleFormDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} pricingRule={null} />
      </div>
      </RequirePermission>
    </DashboardLayout>
  )
}
