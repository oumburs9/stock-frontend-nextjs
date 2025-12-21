"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useCreateTaxRule, useUpdateTaxRule } from "@/lib/hooks/use-finance"
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

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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

  useEffect(() => {
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

  const onSubmit = async (data: CreateTaxRuleRequest) => {
    if (taxRule) {
      await updateMutation.mutateAsync({
        id: taxRule.id,
        data,
      })
    } else {
      await createMutation.mutateAsync(data)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{taxRule ? "Edit Tax Rule" : "Create Tax Rule"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register("name", { required: "Name is required" })} placeholder="VAT 15%" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate">Rate (%) *</Label>
            <Input
              id="rate"
              type="number"
              step="0.01"
              {...register("rate", {
                required: "Rate is required",
                min: { value: 0, message: "Rate must be 0 or more" },
                max: { value: 100, message: "Rate must be 100 or less" },
              })}
              placeholder="15.00"
            />
            {errors.rate && <p className="text-sm text-destructive">{errors.rate.message}</p>}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="validTo">Valid To</Label>
              <Input id="validTo" type="date" {...register("validTo")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
