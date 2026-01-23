"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useCreateCommissionRule, useUpdateCommissionRule } from "@/lib/hooks/use-agent-sales"
import type { CommissionRule, CreateCommissionRuleRequest, UpdateCommissionRuleRequest } from "@/lib/types/agent-sales"
import { useAuth } from "@/lib/hooks/use-auth"

interface CommissionRuleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingRule?: CommissionRule | null
}

export function CommissionRuleFormDialog({ open, onOpenChange, editingRule }: CommissionRuleFormDialogProps) {
  const createMutation = useCreateCommissionRule()
  const updateMutation = useUpdateCommissionRule()
  const isLoading = createMutation.isPending || updateMutation.isPending
  const { hasPermission } = useAuth()

  const [formData, setFormData] = useState({
    name: "",
    commission_type: "license_use" as const,
    basis_type: "percentage" as const,
    value: "",
    currency: "USD",
    valid_from: "",
    valid_to: "",
    is_active: true,
  })

  useEffect(() => {
    if (editingRule) {
      setFormData({
        name: editingRule.name,
        commission_type: editingRule.commission_type,
        basis_type: editingRule.basis_type,
        value: editingRule.value || "",
        currency: editingRule.currency || "USD",
        valid_from: editingRule.valid_from || "",
        valid_to: editingRule.valid_to || "",
        is_active: editingRule.is_active,
      })
    } else {
      setFormData({
        name: "",
        commission_type: "license_use",
        basis_type: "percentage",
        value: "",
        currency: "USD",
        valid_from: "",
        valid_to: "",
        is_active: true,
      })
    }
  }, [editingRule, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingRule && !hasPermission("commission-rule:update")) return
    if (!editingRule && !hasPermission("commission-rule:create")) return

    if (!formData.name || !formData.value) {
      alert("Please fill in all required fields")
      return
    }

    const data = {
      name: formData.name,
      commissionType: formData.commission_type,
      basisType: formData.basis_type,
      value: formData.value,
      currency: formData.currency,
      isActive: formData.is_active,
      validFrom: formData.valid_from || null,
      validTo: formData.valid_to || null,
    }

    if (editingRule) {
      updateMutation.mutate(
        {
          id: editingRule.id,
          data: {
            name: formData.name,
            value: formData.value,
            isActive: formData.is_active,
            validFrom: formData.valid_from || null,
            validTo: formData.valid_to || null,
          } as UpdateCommissionRuleRequest,
        },
        {
          onSuccess: () => onOpenChange(false),
        },
      )
    } else {
      createMutation.mutate(data as CreateCommissionRuleRequest, {
        onSuccess: () => onOpenChange(false),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingRule ? "Edit Commission Rule" : "Create Commission Rule"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Rule Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Standard Commission"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="type">Commission Type *</Label>
            <Select
              value={formData.commission_type}
              onValueChange={(value) =>
                setFormData({ ...formData, commission_type: value as "license_use" | "principal_commission" })
              }
              disabled={isLoading}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="license_use">License Use</SelectItem>
                <SelectItem value="principal_commission">Principal Commission</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="value">Commission Value *</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              placeholder="e.g., 5.00"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="currency">Currency *</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => setFormData({ ...formData, currency: value })}
              disabled={isLoading}
            >
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valid_from">Valid From</Label>
              <Input
                id="valid_from"
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="valid_to">Valid To</Label>
              <Input
                id="valid_to"
                type="date"
                value={formData.valid_to}
                onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
              disabled={isLoading}
            />
            <Label htmlFor="active" className="cursor-pointer">
              Active
            </Label>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
