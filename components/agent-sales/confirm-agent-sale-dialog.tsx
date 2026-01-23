"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useConfirmAgentSale, useCommissionRules } from "@/lib/hooks/use-agent-sales"
import type { AgentSale } from "@/lib/types/agent-sales"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/hooks/use-auth"

interface ConfirmAgentSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agentSale: AgentSale
}

export function ConfirmAgentSaleDialog({ open, onOpenChange, agentSale }: ConfirmAgentSaleDialogProps) {
  const { toast } = useToast()
  const confirmAgentSale = useConfirmAgentSale()
  const { data: commissionRules = [] } = useCommissionRules()
  const [overrideRuleId, setOverrideRuleId] = useState<string>("")
  const [typeValidationError, setTypeValidationError] = useState<string>("")
  const { hasPermission } = useAuth()

  const activeRules = commissionRules.filter((r) => r.is_active)
  const selectedRule = overrideRuleId
    ? commissionRules.find((r) => r.id === overrideRuleId) ||
      (agentSale.commission_rule_id ? commissionRules.find((r) => r.id === agentSale.commission_rule_id) : undefined)
    : agentSale.commission_rule_id
      ? commissionRules.find((r) => r.id === agentSale.commission_rule_id)
      : undefined

  const handleConfirm = () => {
    if (!hasPermission("agent-sale:confirm")) return
    if (selectedRule && selectedRule.commission_type !== agentSale.commission_type) {
      setTypeValidationError(
        `Commission rule type (${selectedRule.commission_type}) does not match sale commission type (${agentSale.commission_type})`,
      )
      return
    }

    setTypeValidationError("")

    confirmAgentSale.mutate(
      {
        id: agentSale.id,
        data: overrideRuleId ? { commissionRuleId: overrideRuleId } : undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: "Agent sale confirmed",
            description: "The agent sale has been confirmed successfully.",
          })
          setOverrideRuleId("")
          onOpenChange(false)
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error?.message || "Failed to confirm agent sale. Please try again.",
            variant: "destructive",
          })
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Confirm Agent Sale
          </DialogTitle>
          <DialogDescription>
            Review the details before confirming this agent sale. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sale Details */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sale Code:</span>
              <span className="font-medium font-mono">{agentSale.code}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sale Date:</span>
              <span className="font-medium">{new Date(agentSale.sale_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Commission Type:</span>
              <span className="font-medium">
                {agentSale.commission_type === "license_use" ? "License Use" : "Principal Commission"}
              </span>
            </div>
          </div>

          {/* Commission Rule Override */}
          <div className="space-y-2">
            <Label htmlFor="override-rule">Commission Rule Override (Optional)</Label>
            <Select value={overrideRuleId} onValueChange={setOverrideRuleId}>
              <SelectTrigger id="override-rule">
                <SelectValue placeholder="Use current commission rule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Use current commission rule</SelectItem>
                {activeRules.map((rule) => (
                  <SelectItem key={rule.id} value={rule.id}>
                    {rule.name} ({rule.value}% -{" "}
                    {rule.commission_type === "license_use" ? "License Use" : "Principal Commission"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type Validation Error */}
          {typeValidationError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-900 dark:text-red-100">{typeValidationError}</p>
            </div>
          )}

          {/* Computation Preview */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Commission Calculation Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-900/70 dark:text-blue-100/70">Gross Total:</span>
                <span className="font-mono font-medium">
                  {formatCurrency(Number.parseFloat(agentSale.gross_total))} {agentSale.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-900/70 dark:text-blue-100/70">
                  Commission ({selectedRule?.value || "0"}%):
                </span>
                <span className="font-mono font-medium text-orange-600">
                  {formatCurrency(Number.parseFloat(agentSale.commission_total))} {agentSale.currency}
                </span>
              </div>
              <div className="flex justify-between border-t border-blue-200 dark:border-blue-900 pt-2">
                <span className="text-blue-900 dark:text-blue-100 font-semibold">Net Principal Amount:</span>
                <span className="font-mono font-bold text-green-600">
                  {formatCurrency(Number.parseFloat(agentSale.net_principal_total))} {agentSale.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Once confirmed, the agent sale status will be locked and you won't be able to edit the items.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={confirmAgentSale.isPending || !!typeValidationError}>
              {confirmAgentSale.isPending ? "Confirming..." : "Confirm Sale"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
