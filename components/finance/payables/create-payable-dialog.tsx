"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import type { AxiosError } from "axios"
import { useCreatePayable } from "@/lib/hooks/use-finance"
import { usePartners } from "@/lib/hooks/use-partners"
import { usePurchaseOrders } from "@/lib/hooks/use-purchase-orders"
import { useShipments } from "@/lib/hooks/use-shipments"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SearchableCombobox } from "@/components/shared/searchable-combobox"
import type { CreatePayableRequest } from "@/lib/types/finance"
import { useAuth } from "@/lib/hooks/use-auth"

interface CreatePayableDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePayableDialog({ open, onOpenChange }: CreatePayableDialogProps) {
  const [sourceType, setSourceType] = useState<"po" | "shipment">("shipment")
  const createMutation = useCreatePayable()
  const { data: suppliers } = usePartners("supplier")
  const { data: purchaseOrders } = usePurchaseOrders()
  const { data: shipments } = useShipments()
  const { hasPermission } = useAuth()
  const toast = useToast()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CreatePayableRequest>({
    defaultValues: {
      supplierId: "",
      purchaseShipmentId: null,
      purchaseOrderId: null,
      payableDate: new Date().toISOString().split("T")[0],
      dueDays: 30,
      currency: "ETB",
      amount: "",
      notes: null,
    },
  })

  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    setFormError(null)

    if (open) {
      reset({
        supplierId: "",
        purchaseShipmentId: null,
        purchaseOrderId: null,
        payableDate: new Date().toISOString().split("T")[0],
        dueDays: 30,
        currency: "ETB",
        amount: "",
        notes: null,
      })
      setSourceType("shipment")
    }
  }, [open, reset])

  const onSubmit = (data: CreatePayableRequest) => {
    if (!hasPermission("payable:create")) return

    setFormError(null)

    const payload: CreatePayableRequest = {
      ...data,
      purchaseShipmentId: sourceType === "shipment" ? data.purchaseShipmentId : null,
      purchaseOrderId: sourceType === "po" ? data.purchaseOrderId : null,
    }

    createMutation
      .mutateAsync(payload)
      .then(() => {
        toast.success("Payable created")
        onOpenChange(false)
      })
      .catch((e: AxiosError) => {
        const parsed = parseApiError(e)

        if (parsed.type === "validation") {
          Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof CreatePayableRequest, { message })
          })
          if (parsed.formError) setFormError(parsed.formError)
          return
        }

        showApiErrorToast(parsed, toast)
      })
  }

  const supplierOptions =
    suppliers?.map((supplier) => ({
      value: supplier.id,
      label: supplier.name,
    })) || []

  const poOptions =
    purchaseOrders?.map((po) => ({
      value: po.id,
      label: `${po.code} - ${new Date(po.order_date).toLocaleDateString()}`,
    })) || []

  const shipmentOptions =
    shipments?.map((shipment) => ({
      value: shipment.id,
      label: `Shipment ${shipment.id.slice(0, 8)} - ${new Date(shipment.shipment_date).toLocaleDateString()}`,
    })) || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Payable</DialogTitle>
        </DialogHeader>

        {formError && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Supplier *</Label>
            <SearchableCombobox
              value={watch("supplierId")}
              onChange={(value) => setValue("supplierId", value)}
              options={supplierOptions}
              placeholder="Select supplier..."
              searchPlaceholder="Search suppliers..."
              emptyMessage="No suppliers found."
            />
            {errors.supplierId?.message && (
              <p className="text-sm text-destructive">{errors.supplierId.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Source *</Label>
            <RadioGroup value={sourceType} onValueChange={(value) => setSourceType(value as "po" | "shipment")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="shipment" id="shipment" />
                <Label htmlFor="shipment" className="font-normal cursor-pointer">
                  From Shipment
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="po" id="po" />
                <Label htmlFor="po" className="font-normal cursor-pointer">
                  From Purchase Order
                </Label>
              </div>
            </RadioGroup>

            {sourceType === "shipment" && (
              <SearchableCombobox
                value={watch("purchaseShipmentId") || ""}
                onChange={(value) => setValue("purchaseShipmentId", value)}
                options={shipmentOptions}
                placeholder="Select shipment..."
                searchPlaceholder="Search shipments..."
                emptyMessage="No shipments found."
              />
            )}

            {sourceType === "po" && (
              <SearchableCombobox
                value={watch("purchaseOrderId") || ""}
                onChange={(value) => setValue("purchaseOrderId", value)}
                options={poOptions}
                placeholder="Select purchase order..."
                searchPlaceholder="Search purchase orders..."
                emptyMessage="No purchase orders found."
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payableDate">Payable Date *</Label>
              <Input id="payableDate" type="date" {...register("payableDate")} />
              {errors.payableDate?.message && (
                <p className="text-sm text-destructive">{errors.payableDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDays">Due Days *</Label>
              <Input id="dueDays" type="number" {...register("dueDays", { valueAsNumber: true })} />
              {errors.dueDays?.message && <p className="text-sm text-destructive">{errors.dueDays.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Input id="currency" {...register("currency")} />
              {errors.currency?.message && <p className="text-sm text-destructive">{errors.currency.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input id="amount" type="number" step="0.01" {...register("amount")} />
              {errors.amount?.message && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Supplier invoice notes..." rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Payable"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
