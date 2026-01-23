"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  commissionType: z.enum(["license_use", "principal_commission"]),
  basisType: z.literal("percentage"),
  value: z.string().min(1, "Value is required"),
  currency: z.string().min(1, "Currency is required"),
  isActive: z.boolean().default(true),
  validFrom: z.string().optional().nullable(),
  validTo: z.string().optional().nullable(),
})

type FormData = z.infer<typeof formSchema>

interface CommissionRuleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule?: CommissionRule | null
}

export function CommissionRuleFormDialog({ open, onOpenChange, rule }: CommissionRuleFormDialogProps) {
  const { toast } = useToast()
  const createMutation = useCreateCommissionRule()
  const updateMutation = useUpdateCommissionRule()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
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
    } else {
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
    }
  }, [rule, reset, open])

  const onSubmit = async (data: FormData) => {
    try {
      if (rule) {
        await updateMutation.mutateAsync({ id: rule.id, data })
        toast({ title: "Rule updated", description: "Commission rule updated successfully" })
      } else {
        await createMutation.mutateAsync(data)
        toast({ title: "Rule created", description: "Commission rule created successfully" })
      }
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save rule",
        variant: "destructive",
      })
    }
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
            <Input id="name" {...register("name")} placeholder="e.g., Standard License Commission" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Commission Type</Label>
              <Select
                value={watch("commissionType")}
                onValueChange={(v) => setValue("commissionType", v as any)}
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
              <Input id="value" type="number" step="0.01" {...register("value")} />
              {errors.value && <p className="text-sm text-destructive">{errors.value.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" {...register("currency")} />
              {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch id="isActive" checked={isActive} onCheckedChange={(v) => setValue("isActive", v)} />
              <Label htmlFor="isActive">Active Status</Label>
            </div>
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
