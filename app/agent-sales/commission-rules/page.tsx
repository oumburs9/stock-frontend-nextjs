"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { CommissionRuleTable } from "@/components/agent-sales/commission-rules/commission-rule-table"
import { RequirePermission } from "@/components/auth/require-permission"

export default function CommissionRulesPage() {
  return (
    <DashboardLayout>
      <RequirePermission permission="commission-rule:view">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Commission Rules</h1>
            <p className="text-muted-foreground">Manage agent sales commission policies</p>
          </div>
          <CommissionRuleTable />
        </div>
      </RequirePermission>
    </DashboardLayout>
  )
}
