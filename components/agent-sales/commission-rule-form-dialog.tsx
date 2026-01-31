"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useCreateCommissionRule, useUpdateCommissionRule } from "@/lib/hooks/use-agent-sales"
import type { CommissionRule } from "@/lib/types/agent-sales"
import type { AxiosError } from "axios"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"

type FormData = {
  name: string
  commissionType: "license_use" | "principal_commission"
  basisType: "percentage"
  value: string
  currency: string
  isActive: boolean
  validFrom?: string | null
  validTo?: string | null
}

interface CommissionRuleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule?: CommissionRule | null
}

export function CommissionRuleFormDialog({ open, onOpenChange, rule }: CommissionRuleFormDialogProps) {
  const toast = useToast()
  const createMutation = useCreateCommissionRule()
  const updateMutation = useUpdateCommissionRule()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      commissionType: "license_use",
      basisType: "percentage",
      value: "10.00",
      currency: "ETB",
      isActive: true,
      validFrom: null,
      validTo: null,
    },
  })

  const isActive = watch("isActive")

  useEffect(() => {
    if (!open) {
      reset({
        name: "",
        commissionType: "license_use",
        basisType: "percentage",
        value: "10.00",
        currency: "ETB",
        isActive: true,
        validFrom: null,
        validTo: null,
      })
      clearErrors()
      return
    }

    if (rule) {
      reset({
        name: rule.name,
        commissionType: rule.commission_type,
        basisType: rule.basis_type,
        value: rule.value,
        currency: rule.currency,
        isActive: rule.is_active,
        validFrom: rule.valid_from ? rule.valid_from.split("T")[0] : null,
        validTo: rule.valid_to ? rule.valid_to.split("T")[0] : null,
      })
    }
  }, [rule, reset, open, clearErrors])

  const onSubmit = (data: FormData) => {
    const action = rule
      ? updateMutation.mutateAsync({ id: rule.id, data })
      : createMutation.mutateAsync(data)

    action
      .then(() => {
        toast.success(rule ? "Rule updated" : "Rule created")
        onOpenChange(false)
      })
      .catch((e: AxiosError) => {
        const parsed = parseApiError(e)

        if (parsed.type === "validation") {
          Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof FormData, { message })
          })
          return
        }

        showApiErrorToast(parsed, toast, "Failed to save rule")
      })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{rule ? "Edit Commission Rule" : "Create Commission Rule"}</DialogTitle>
          <DialogDescription>
            {rule ? "Update the commission policy details" : "Define a new commission policy for agent sales"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Standard License Commission"
              onChange={(e) => {
                setValue("name", e.target.value)
                clearErrors("name")
              }}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Commission Type</Label>
              <Select
                value={watch("commissionType")}
                onValueChange={(v) => {
                  setValue("commissionType", v as "license_use" | "principal_commission")
                  clearErrors("commissionType")
                }}
                disabled={!!rule}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="license_use">License Use</SelectItem>
                  <SelectItem value="principal_commission">Principal Commission</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value (%)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                {...register("value")}
                onChange={(e) => {
                  setValue("value", e.target.value)
                  clearErrors("value")
                }}
              />
              {errors.value && <p className="text-sm text-destructive">{errors.value.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                {...register("currency")}
                onChange={(e) => {
                  setValue("currency", e.target.value)
                  clearErrors("currency")
                }}
              />
              {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={(v) => {
                  setValue("isActive", v)
                  clearErrors("isActive")
                }}
              />
              <Label htmlFor="isActive">Active Status</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Valid From</Label>
              <Input
                id="validFrom"
                type="date"
                {...register("validFrom")}
                onChange={(e) => {
                  setValue("validFrom", e.target.value)
                  clearErrors("validFrom")
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validTo">Valid To</Label>
              <Input
                id="validTo"
                type="date"
                {...register("validTo")}
                onChange={(e) => {
                  setValue("validTo", e.target.value)
                  clearErrors("validTo")
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {rule ? "Update Rule" : "Create Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
