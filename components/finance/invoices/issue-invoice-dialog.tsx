"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useIssueInvoice } from "@/lib/hooks/use-finance"
import { useSalesOrders } from "@/lib/hooks/use-sales"
import { useTaxRules } from "@/lib/hooks/use-finance"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchableCombobox } from "@/components/shared/searchable-combobox"
import type { IssueInvoiceRequest } from "@/lib/types/finance"
import { useAuth } from "@/lib/hooks/use-auth"

interface IssueInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (invoiceId: string) => void
}

export function IssueInvoiceDialog({ open, onOpenChange, onSuccess }: IssueInvoiceDialogProps) {
  const issueMutation = useIssueInvoice()
  const { data: salesOrders } = useSalesOrders()
  const { data: taxRules } = useTaxRules()
  const { hasPermission } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IssueInvoiceRequest>({
    defaultValues: {
      salesOrderId: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDays: 30,
      taxRuleId: null,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        salesOrderId: "",
        invoiceDate: new Date().toISOString().split("T")[0],
        dueDays: 30,
        taxRuleId: null,
      })
    }
  }, [open, reset])

  const onSubmit = async (data: IssueInvoiceRequest) => {
    if (!hasPermission("invoice:issue")) return
    const result = await issueMutation.mutateAsync(data)
    onOpenChange(false)
    if (onSuccess) {
      onSuccess(result.id)
    }
  }

  const deliveredOrders = salesOrders?.filter((order) => order.status === "delivered") || []

  const salesOrderOptions = deliveredOrders.map((order) => ({
    value: order.id,
    label: `${order.code} - ${new Date(order.order_date).toLocaleDateString()}`,
  }))

  const activeTaxRules = taxRules?.filter((rule) => rule.is_active) || []

  const taxRuleOptions = [
    { value: "null", label: "No Tax" },
    ...activeTaxRules.map((rule) => ({
      value: rule.id,
      label: `${rule.name} (${rule.rate}%)`,
    })),
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Issue Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Sales Order *</Label>
            <SearchableCombobox
              value={watch("salesOrderId")}
              onChange={(value) => setValue("salesOrderId", value)}
              options={salesOrderOptions}
              placeholder="Select sales order..."
              searchPlaceholder="Search sales orders..."
              emptyMessage="No delivered sales orders found."
            />
            {errors.salesOrderId && <p className="text-sm text-destructive">{errors.salesOrderId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Invoice Date *</Label>
              <Input
                id="invoiceDate"
                type="date"
                {...register("invoiceDate", { required: "Invoice date is required" })}
              />
              {errors.invoiceDate && <p className="text-sm text-destructive">{errors.invoiceDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDays">Due Days *</Label>
              <Input
                id="dueDays"
                type="number"
                {...register("dueDays", {
                  required: "Due days is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Must be 0 or more" },
                })}
              />
              {errors.dueDays && <p className="text-sm text-destructive">{errors.dueDays.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tax Rule</Label>
            <SearchableCombobox
              value={watch("taxRuleId") === null ? "null" : watch("taxRuleId") || ""}
              onChange={(value) => setValue("taxRuleId", value === "null" ? null : value)}
              options={taxRuleOptions}
              placeholder="Select tax rule..."
              searchPlaceholder="Search tax rules..."
              emptyMessage="No tax rules found."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={issueMutation.isPending}>
              {issueMutation.isPending ? "Issuing..." : "Issue Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
