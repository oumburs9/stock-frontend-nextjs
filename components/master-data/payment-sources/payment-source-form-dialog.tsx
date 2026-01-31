"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import type { AxiosError } from "axios"

import { useCreatePaymentSource, useUpdatePaymentSource } from "@/lib/hooks/use-payment-sources"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"
import { useToast } from "@/hooks/use-toast"

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

type PaymentSourceFormValues = {
  name: string
  type: PaymentSourceType
  account_number?: string | null
  is_active: boolean
}

interface PaymentSourceFormDialogProps {
  paymentSource: PaymentSource | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaymentSourceFormDialog({ paymentSource, open, onOpenChange }: PaymentSourceFormDialogProps) {
  const toast = useToast()
  const createMutation = useCreatePaymentSource()
  const updateMutation = useUpdatePaymentSource()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm<PaymentSourceFormValues>({
    defaultValues: {
      name: "",
      type: "bank_account",
      account_number: "",
      is_active: true,
    },
  })

  const isActive = watch("is_active")

  useEffect(() => {
    if (paymentSource) {
      reset({
        name: paymentSource.name,
        type: paymentSource.type,
        account_number: paymentSource.account_number || "",
        is_active: paymentSource.is_active,
      })
    } else {
      reset({
        name: "",
        type: "bank_account",
        account_number: "",
        is_active: true,
      })
    }
  }, [paymentSource, open, reset])

  const onSubmit = (values: PaymentSourceFormValues) => {
    const action = paymentSource
      ? updateMutation.mutateAsync({ id: paymentSource.id, data: values })
      : createMutation.mutateAsync(values)

    action
      .then(() => {
        toast.success(
          paymentSource ? "Payment source updated" : "Payment source created"
        )
        onOpenChange(false)
      })
      .catch((e: AxiosError) => {
        const parsed = parseApiError(e)

        if (parsed.type === "validation") {
          Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof PaymentSourceFormValues, { message })
          })
          return
        }

        showApiErrorToast(parsed, toast)
      })
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{paymentSource ? "Edit Payment Source" : "Create Payment Source"}</DialogTitle>
          <DialogDescription>
            {paymentSource
              ? "Update payment source information"
              : "Add a new payment source for tracking payments"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name?.message && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={watch("type")}
              onValueChange={(value) =>
                reset({ ...watch(), type: value as PaymentSourceType })
              }
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
            <Input id="account_number" {...register("account_number")} />
            {errors.account_number?.message && (
              <p className="text-sm text-destructive">{errors.account_number.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Active</Label>
              <p className="text-sm text-muted-foreground">
                Allow this source to be used for new payments
              </p>
            </div>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) =>
                reset({ ...watch(), is_active: checked })
              }
            />
          </div>

          {!isActive && paymentSource && (
            <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900 border border-amber-200">
              <strong>Warning:</strong> Inactive sources cannot be used for new payments.
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : paymentSource ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
