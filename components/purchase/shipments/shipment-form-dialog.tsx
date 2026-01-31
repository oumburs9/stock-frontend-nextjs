"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import type { AxiosError } from "axios"

import { useCreateShipment, useUpdateShipment } from "@/lib/hooks/use-shipments"
import { useProducts } from "@/lib/hooks/use-products"
import { usePurchaseOrders } from "@/lib/hooks/use-purchase-orders"
import { usePartners } from "@/lib/hooks/use-partners"

import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2 } from "lucide-react"
import { SearchableCombobox } from "@/components/shared/searchable-combobox"

import type { PurchaseShipment, CreateShipmentRequest } from "@/lib/types/purchase"
import { useAuth } from "@/lib/hooks/use-auth"

interface ShipmentItemRow {
  po_item_id: string | null
  product_id: string
  quantity_expected: string
  linked_po_id?: string
}

interface ShipmentFormDialogProps {
  shipment: PurchaseShipment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ShipmentFormValues = {
  code: string
  type: "import" | "local"
  supplier_id: string
  departure_date: string | null
  arrival_date: string | null
  currency: string
  exchange_rate: string | null
  notes: string | null
  items: ShipmentItemRow[]
}

export function ShipmentFormDialog({ shipment, open, onOpenChange }: ShipmentFormDialogProps) {
  const toast = useToast()
  const createMutation = useCreateShipment()
  const updateMutation = useUpdateShipment()

  const { data: products } = useProducts()
  const { data: purchaseOrders } = usePurchaseOrders({ status: "approved" })
  const { data: suppliers } = usePartners("supplier")
  const { hasPermission } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ShipmentFormValues>({
    defaultValues: {
      code: "",
      type: "import",
      supplier_id: "",
      departure_date: null,
      arrival_date: null,
      currency: "ETB",
      exchange_rate: null,
      notes: null,
      items: [{ po_item_id: null, product_id: "", quantity_expected: "1", linked_po_id: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const [poDetailsCache, setPoDetailsCache] = useState<Record<string, any>>({})
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    setFormError(null)

    if (shipment) {
      reset({
        code: shipment.code,
        type: shipment.type,
        supplier_id: shipment.supplier_id,
        departure_date: shipment.departure_date,
        arrival_date: shipment.arrival_date,
        currency: shipment.currency || "ETB",
        exchange_rate: shipment.exchange_rate,
        notes: shipment.notes ?? null,
        items: shipment.items.map((item) => ({
          po_item_id: item.purchase_order_item_id,
          product_id: item.product_id,
          quantity_expected: item.quantity_expected,
          linked_po_id: "",
        })),
      })
    } else {
      reset({
        code: "",
        type: "import",
        supplier_id: "",
        departure_date: null,
        arrival_date: null,
        currency: "ETB",
        exchange_rate: null,
        notes: null,
        items: [{ po_item_id: null, product_id: "", quantity_expected: "1", linked_po_id: "" }],
      })
    }
  }, [shipment, reset, open])

  const handlePOSelection = async (index: number, poId: string) => {
    if (!poId) {
      setValue(`items.${index}.po_item_id`, null)
      setValue(`items.${index}.product_id`, "")
      setValue(`items.${index}.linked_po_id`, "")
      return
    }

    if (!poDetailsCache[poId]) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/purchase/orders/${poId}`)
        const poDetails = await response.json()
        setPoDetailsCache((prev) => ({ ...prev, [poId]: poDetails }))
      } catch {
        const po = purchaseOrders?.find((p: any) => p.id === poId)
        if (po) {
          setPoDetailsCache((prev) => ({ ...prev, [poId]: po }))
        }
      }
    }

    setValue(`items.${index}.linked_po_id`, poId)
  }

  const handlePOItemSelection = (index: number, poItemId: string) => {
    const linkedPoId = watch(`items.${index}.linked_po_id`)
    if (!linkedPoId || !poItemId) return

    const poDetails = poDetailsCache[linkedPoId]
    if (poDetails) {
      const poItem = poDetails.items?.find((item: any) => item.id === poItemId)
      if (poItem) {
        setValue(`items.${index}.po_item_id`, poItemId)
        setValue(`items.${index}.product_id`, poItem.product_id)
        setValue(`items.${index}.quantity_expected`, poItem.quantity)
      }
    }
  }

  const onSubmit = (data: ShipmentFormValues) => {
    setFormError(null)

    const transformedItems = data.items.map((item) => ({
      ...(item.po_item_id && { purchase_order_item_id: item.po_item_id }),
      product_id: item.product_id,
      quantity_expected: item.quantity_expected,
    }))

    const payload: CreateShipmentRequest = {
      code: data.code,
      type: data.type,
      supplier_id: data.supplier_id,
      departure_date: data.departure_date || undefined,
      arrival_date: data.arrival_date || undefined,
      currency: data.currency,
      exchange_rate: data.exchange_rate || undefined,
      notes: data.notes || undefined,
      items: transformedItems,
    }

    const action = shipment
      ? updateMutation.mutateAsync({
          id: shipment.id,
          data: {
            departure_date: data.departure_date || undefined,
            arrival_date: data.arrival_date || undefined,
            exchange_rate: data.exchange_rate || undefined,
            notes: data.notes || undefined,
            items: transformedItems,
          },
        })
      : createMutation.mutateAsync(payload)

    action
      .then(() => {
        toast.success(shipment ? "Shipment updated" : "Shipment created")
        onOpenChange(false)
        reset()
      })
      .catch((e: AxiosError) => {
        // console.log("e: ", e)
        const parsed = parseApiError(e)
        // console.log("e: ", parsed)

        if (parsed.type === "validation") {
          Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
            setError(field as any, { message })
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

  const productOptions =
    products?.map((product) => ({
      value: product.id,
      label: `${product.name} (${product.sku})`,
    })) || []

  const poOptions =
    purchaseOrders?.map((po: any) => ({
      value: po.id,
      label: `${po.code} - ${new Date(po.order_date).toLocaleDateString()}`,
    })) || []

  const getPOItemOptions = (poId: string) => {
    const poDetails = poDetailsCache[poId]
    if (!poDetails?.items) return []

    return poDetails.items.map((item: any) => ({
      value: item.id,
      label: `${products?.find((p) => p.id === item.product_id)?.name || "Product"} - Qty: ${item.quantity}`,
    }))
  }

  const canEditItems = !shipment || shipment.status === "draft"
  const canEditSupplier = !shipment
  const isEditMode = !!shipment

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{shipment ? "Edit Shipment (BL)" : "Create Shipment (BL)"}</DialogTitle>
        </DialogHeader>

        {formError && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ---------- SHIPMENT HEADER ---------- */}
          <div className="space-y-4 p-4 border rounded-md bg-muted/30">
            <h3 className="font-medium text-sm">Shipment Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">BL Code *</Label>
                <Input id="code" {...register("code")} disabled={isEditMode} placeholder="BL-001" />
                {errors.code?.message && (
                  <p className="text-sm text-destructive">{errors.code.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <select
                  id="type"
                  {...register("type")}
                  disabled={isEditMode}
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
                >
                  <option value="import">Import</option>
                  <option value="local">Local</option>
                </select>
                {errors.type?.message && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Supplier *</Label>
              <SearchableCombobox
                value={watch("supplier_id")}
                 onChange={(v) => {
                        setValue("supplier_id", v)
                        clearErrors("supplier_id")
                      }}
                options={supplierOptions}
                disabled={!canEditSupplier}
                placeholder="Select supplier..."
              />
              {errors.supplier_id?.message && (
                <p className="text-sm text-destructive">{errors.supplier_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departure_date">Departure Date</Label>
                <Input id="departure_date" type="date" {...register("departure_date")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrival_date">Arrival Date</Label>
                <Input id="arrival_date" type="date" {...register("arrival_date")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Input id="currency" {...register("currency")} placeholder="ETB" />
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="exchange_rate">Exchange Rate</Label>
                <Input
                  id="exchange_rate"
                  type="number"
                  step="0.0001"
                  {...register("exchange_rate")}
                  placeholder="1.0"
                />
              </div> */}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register("notes")} placeholder="Enter any additional notes..." rows={2} />
            </div>
          </div>

          {/* ---------- ITEMS ---------- */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-base">Shipment Items *</Label>
              {canEditItems && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    append({ po_item_id: null, product_id: "", quantity_expected: "1", linked_po_id: "" })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              )}
            </div>

            {fields.map((field, index) => {
              const linkedPoId = watch(`items.${index}.linked_po_id`)
              const poItemId = watch(`items.${index}.po_item_id`)
              const isPOLinked = !!poItemId

              return (
                <div key={field.id} className="p-4 border rounded-md space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Item {index + 1}</span>
                    {canEditItems && fields.length > 1 && (
                      <Button type="button" size="sm" variant="ghost" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {canEditItems && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Link to Purchase Order (Optional)</Label>
                      <SearchableCombobox
                        value={linkedPoId || ""}
                        onChange={(v) => handlePOSelection(index, v)}
                        options={poOptions}
                        placeholder="Select PO to link (or leave blank)..."
                        searchPlaceholder="Search POs..."
                        emptyMessage="No approved POs found."
                      />
                    </div>
                  )}

                  {canEditItems && linkedPoId && (
                    <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">PO Item</Label>
                    <SearchableCombobox
                      value={poItemId || ""}
                      onChange={(v) => handlePOItemSelection(index, v)}
                      options={getPOItemOptions(linkedPoId)}
                      placeholder="Select PO item"
                      searchPlaceholder="Search PO items..."
                      emptyMessage="No items found in this PO."
                      
                    />
                    </div>
                  )}
                  <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Product *</Label>
                  <SearchableCombobox
                    value={watch(`items.${index}.product_id`)}
                    onChange={(v) => setValue(`items.${index}.product_id`, v)}
                    options={productOptions}
                    disabled={isPOLinked || !canEditItems}
                    placeholder="Select product"
                    searchPlaceholder="Search products..."
                    emptyMessage="No products found."
                  />
                  </div>
                  <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Quantity Expected *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.quantity_expected`)}
                    disabled={!canEditItems}
                    placeholder="Enter quantity"
                  />

                  {errors.items?.[index]?.quantity_expected?.message && (
                    <p className="text-xs text-destructive">
                      {errors.items[index]?.quantity_expected?.message}
                    </p>
                  )}
              </div>
                </div>
              )
            })}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                Boolean(
                createMutation.isPending ||
                updateMutation.isPending ||
                (!shipment && !hasPermission("purchase-shipment:create")) ||
                (shipment && !hasPermission("purchase-shipment:update"))
                )
              }
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
