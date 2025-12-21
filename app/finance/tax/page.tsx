"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TaxRulesTable } from "@/components/finance/tax/tax-rules-table"
import { TaxRuleFormDialog } from "@/components/finance/tax/tax-rule-form-dialog"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus } from "lucide-react"
import { useTaxConfig, useTaxRules, useUpsertTaxConfig } from "@/lib/hooks/use-finance"
import { SearchableCombobox } from "@/components/shared/searchable-combobox"

export default function TaxPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { data: taxConfig } = useTaxConfig()
  const { data: taxRules } = useTaxRules()
  const upsertConfigMutation = useUpsertTaxConfig()

  const isEnabled = taxConfig?.is_enabled || false
  const defaultTaxRuleId = taxConfig?.default_tax_rule_id || null

  const handleEnableChange = async (checked: boolean) => {
    await upsertConfigMutation.mutateAsync({
      isEnabled: checked,
      defaultTaxRuleId: defaultTaxRuleId || null,
    })
  }

  const handleDefaultTaxRuleChange = async (value: string) => {
    await upsertConfigMutation.mutateAsync({
      isEnabled,
      defaultTaxRuleId: value || null,
    })
  }

  const taxRuleOptions =
    taxRules
      ?.filter((rule) => rule.is_active)
      .map((rule) => ({
        value: rule.id,
        label: `${rule.name} (${rule.rate}%)`,
      })) || []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Tax Configuration" description="Manage tax settings and rules" />

        <Card>
          <CardHeader>
            <CardTitle>Tax Settings</CardTitle>
            <CardDescription>Configure global tax settings and default tax rule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tax-enabled" className="text-base">
                  Enable Tax
                </Label>
                <p className="text-sm text-muted-foreground">Apply tax rules to invoices</p>
              </div>
              <Switch
                id="tax-enabled"
                checked={isEnabled}
                onCheckedChange={handleEnableChange}
                disabled={upsertConfigMutation.isPending}
              />
            </div>

            {isEnabled && (
              <div className="space-y-2">
                <Label>Default Tax Rule</Label>
                <SearchableCombobox
                  value={defaultTaxRuleId || ""}
                  onChange={handleDefaultTaxRuleChange}
                  options={taxRuleOptions}
                  placeholder="Select default tax rule..."
                  searchPlaceholder="Search tax rules..."
                  emptyMessage="No active tax rules found."
                  disabled={upsertConfigMutation.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  This tax rule will be automatically applied to new invoices
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tax Rules</CardTitle>
                <CardDescription>Manage tax rates and validity periods</CardDescription>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Tax Rule
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TaxRulesTable />
          </CardContent>
        </Card>

        <TaxRuleFormDialog taxRule={null} open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
      </div>
    </DashboardLayout>
  )
}
