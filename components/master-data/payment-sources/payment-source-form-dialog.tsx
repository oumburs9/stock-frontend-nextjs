"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useCreatePaymentSource, useUpdatePaymentSource } from "@/lib/hooks/use-payment-sources"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { PaymentSource, PaymentSourceType } from "@/lib/types/payment-source"

interface PaymentSourceFormDialogProps {
  paymentSource: PaymentSource | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaymentSourceFormDialog({ paymentSource, open, onOpenChange }: PaymentSourceFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "bank_account" as PaymentSourceType,
    account_number: "",
    is_active: true,
  })
  const [showInactiveWarning, setShowInactiveWarning] = useState(false)

  const createMutation = useCreatePaymentSource()
  const updateMutation = useUpdatePaymentSource()

  useEffect(() => {
    if (paymentSource) {
      setFormData({
        name: paymentSource.name,
        type: paymentSource.type,
        account_number: paymentSource.account_number || "",
        is_active: paymentSource.is_active,
      })
      setShowInactiveWarning(false)
    } else {
      setFormData({
        name: "",
        type: "bank_account",
        account_number: "",
        is_active: true,
      })
      setShowInactiveWarning(false)
    }
  }, [paymentSource, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      name: formData.name,
      type: formData.type,
      account_number: formData.account_number || null,
      is_active: formData.is_active,
    }

    if (paymentSource) {
      updateMutation.mutate(
        { id: paymentSource.id, data: payload },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        },
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false)
        },
      })
    }
  }

  const handleActiveChange = (checked: boolean) => {
    setFormData({ ...formData, is_active: checked })
    if (!checked && paymentSource) {
      setShowInactiveWarning(true)
    } else {
      setShowInactiveWarning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{paymentSource ? "Edit Payment Source" : "Create Payment Source"}</DialogTitle>
          <DialogDescription>
            {paymentSource ? "Update payment source information" : "Add a new payment source for tracking payments"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., CBEB Main Bank Account"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as PaymentSourceType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_account">Bank Account</SelectItem>
                <SelectItem value="cash_register">Cash Register</SelectItem>
                <SelectItem value="mobile_wallet">Mobile Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="account_number">Account Number</Label>
            <Input
              id="account_number"
              value={formData.account_number}
              onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Active</Label>
              <p className="text-sm text-muted-foreground">Allow this source to be used for new payments</p>
            </div>
            <Switch id="is_active" checked={formData.is_active} onCheckedChange={handleActiveChange} />
          </div>
          {showInactiveWarning && (
            <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900 border border-amber-200">
              <strong>Warning:</strong> Inactive sources cannot be used for new payments.
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : paymentSource ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
