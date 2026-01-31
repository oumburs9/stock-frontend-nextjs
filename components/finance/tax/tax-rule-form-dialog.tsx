"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import type { AxiosError } from "axios"
import { useCreateTaxRule, useUpdateTaxRule } from "@/lib/hooks/use-finance"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { TaxRule, CreateTaxRuleRequest } from "@/lib/types/finance"

interface TaxRuleFormDialogProps {
  taxRule: TaxRule | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaxRuleFormDialog({ taxRule, open, onOpenChange }: TaxRuleFormDialogProps) {
  const createMutation = useCreateTaxRule()
  const updateMutation = useUpdateTaxRule()
  const toast = useToast()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CreateTaxRuleRequest>({
    defaultValues: {
      name: "",
      rate: "",
      isActive: true,
      validFrom: null,
      validTo: null,
    },
  })

  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    setFormError(null)

    if (taxRule) {
      reset({
        name: taxRule.name,
        rate: taxRule.rate,
        isActive: taxRule.is_active,
        validFrom: taxRule.valid_from,
        validTo: taxRule.valid_to,
      })
    } else {
      reset({
        name: "",
        rate: "",
        isActive: true,
        validFrom: null,
        validTo: null,
      })
    }
  }, [taxRule, open, reset])

  const onSubmit = (data: CreateTaxRuleRequest) => {
    setFormError(null)

    const action = taxRule
      ? updateMutation.mutateAsync({
          id: taxRule.id,
          data,
        })
      : createMutation.mutateAsync(data)

    action
      .then(() => {
        toast.success(taxRule ? "Tax rule updated" : "Tax rule created")
        onOpenChange(false)
      })
      .catch((e: AxiosError) => {
        const parsed = parseApiError(e)

        if (parsed.type === "validation") {
          Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof CreateTaxRuleRequest, { message })
          })
          if (parsed.formError) setFormError(parsed.formError)
          return
        }

        showApiErrorToast(parsed, toast)
      })
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{taxRule ? "Edit Tax Rule" : "Create Tax Rule"}</DialogTitle>
        </DialogHeader>

        {formError && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register("name")} placeholder="VAT 15%" />
            {errors.name?.message && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate">Rate (%) *</Label>
            <Input id="rate" type="number" step="0.01" {...register("rate")} placeholder="15.00" />
            {errors.rate?.message && <p className="text-sm text-destructive">{errors.rate.message}</p>}
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="isActive" className="cursor-pointer">
              Active
            </Label>
            <Switch
              id="isActive"
              checked={watch("isActive")}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Valid From</Label>
              <Input id="validFrom" type="date" {...register("validFrom")} />
              {errors.validFrom?.message && (
                <p className="text-sm text-destructive">{errors.validFrom.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="validTo">Valid To</Label>
              <Input id="validTo" type="date" {...register("validTo")} />
              {errors.validTo?.message && <p className="text-sm text-destructive">{errors.validTo.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
