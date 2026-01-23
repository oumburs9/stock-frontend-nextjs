"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { useCreateShipment, useUpdateShipment } from "@/lib/hooks/use-shipments"
import { useProducts } from "@/lib/hooks/use-products"
import { usePurchaseOrders } from "@/lib/hooks/use-purchase-orders"
import { usePartners } from "@/lib/hooks/use-partners"
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

export function ShipmentFormDialog({ shipment, open, onOpenChange }: ShipmentFormDialogProps) {
  const { toast } = useToast()
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
    formState: { errors },
  } = useForm<{
    code: string
    type: "import" | "local"
    supplier_id: string
    departure_date: string | null
    arrival_date: string | null
    currency: string
    exchange_rate: string | null
    notes: string | null
    items: ShipmentItemRow[]
  }>({
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

  useEffect(() => {
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
  }, [shipment, reset])

  const handlePOSelection = async (index: number, poId: string) => {
    if (!poId) {
      setValue(`items.${index}.po_item_id`, null)
      setValue(`items.${index}.product_id`, "")
      setValue(`items.${index}.linked_po_id`, "")
      return
    }

    // Fetch PO details if not cached
    if (!poDetailsCache[poId]) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/purchase/orders/${poId}`)
        const poDetails = await response.json()
        setPoDetailsCache((prev) => ({ ...prev, [poId]: poDetails }))
      } catch (error) {
        // Fallback to using purchaseOrders data
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

  const onSubmit = async (data: any) => {
    try {
      const transformedItems = data.items.map((item: ShipmentItemRow) => ({
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

      if (shipment) {
        await updateMutation.mutateAsync({
          id: shipment.id,
          data: {
            arrival_date: data.arrival_date || null,
            departure_date: data.departure_date  || null,
            exchange_rate: data.exchange_rate  || null,
            notes: data.notes  || null,
            // Note: receiving_warehouse_id and receiving_shop_id are set during receiving, not here
            items: transformedItems,
          },
        })
        toast({
          title: "Success",
          description: "Shipment updated successfully",
        })
      } else {
        await createMutation.mutateAsync(payload)
        toast({
          title: "Success",
          description: "Shipment created successfully",
        })
      }
      onOpenChange(false)
      reset()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      })
    }
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
  const canEditSupplier = !shipment // Supplier cannot be changed after creation per frozen API
  const isEditMode = !!shipment

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{shipment ? "Edit Shipment (BL)" : "Create Shipment (BL)"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Section 1: Shipment Header */}
          <div className="space-y-4 p-4 border rounded-md bg-muted/30">
            <h3 className="font-medium text-sm">Shipment Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">BL Code *</Label>
                <Input
                  id="code"
                  {...register("code", { required: "Code is required" })}
                  disabled={isEditMode}
                  placeholder="BL-001"
                />
                {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <select
                  id="type"
                  {...register("type", { required: "Type is required" })}
                  disabled={isEditMode}
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="import">Import</option>
                  <option value="local">Local</option>
                </select>
                {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Supplier *</Label>
              <SearchableCombobox
                value={watch("supplier_id")}
                onChange={(value) => setValue("supplier_id", value)}
                options={supplierOptions}
                placeholder="Select supplier..."
                searchPlaceholder="Search suppliers..."
                emptyMessage="No suppliers found."
                disabled={!canEditSupplier}
              />
              {errors.supplier_id && <p className="text-sm text-destructive">{errors.supplier_id.message}</p>}
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

              <div className="space-y-2">
                <Label htmlFor="exchange_rate">Exchange Rate</Label>
                <Input
                  id="exchange_rate"
                  type="number"
                  step="0.0001"
                  {...register("exchange_rate")}
                  placeholder="1.0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register("notes")} placeholder="Enter any additional notes..." rows={2} />
            </div>
          </div>

          {/* Section 2: Shipment Items (Flexible Repeater) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Shipment Items *</Label>
              {canEditItems && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => append({ po_item_id: null, product_id: "", quantity_expected: "1", linked_po_id: "" })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              )}
            </div>

            {fields.map((field, index) => {
              const linkedPoId = watch(`items.${index}.linked_po_id`)
              const poItemId = watch(`items.${index}.po_item_id`)
              const isPOLinked = !!poItemId

              return (
                <div key={field.id} className="p-4 border rounded-md bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Item {index + 1}</span>
                    {canEditItems && fields.length > 1 && (
                      <Button type="button" size="sm" variant="ghost" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* PO Selection (Optional) */}
                  {canEditItems && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Link to Purchase Order (Optional)</Label>
                      <SearchableCombobox
                        value={linkedPoId || ""}
                        onChange={(value) => handlePOSelection(index, value)}
                        options={poOptions}
                        placeholder="Select PO to link (or leave blank)..."
                        searchPlaceholder="Search POs..."
                        emptyMessage="No approved POs found."
                      />
                    </div>
                  )}

                  {/* If PO selected, show PO Item selector */}
                  {canEditItems && linkedPoId && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">PO Item</Label>
                      <SearchableCombobox
                        value={poItemId || ""}
                        onChange={(value) => handlePOItemSelection(index, value)}
                        options={getPOItemOptions(linkedPoId)}
                        placeholder="Select PO item..."
                        searchPlaceholder="Search PO items..."
                        emptyMessage="No items found in this PO."
                      />
                    </div>
                  )}

                  {/* Product (auto-filled if PO item selected, manual otherwise) */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Product *</Label>
                    <SearchableCombobox
                      value={watch(`items.${index}.product_id`)}
                      onChange={(value) => setValue(`items.${index}.product_id`, value)}
                      options={productOptions}
                      placeholder="Select product..."
                      searchPlaceholder="Search products..."
                      emptyMessage="No products found."
                      disabled={isPOLinked || !canEditItems}
                    />
                    {errors.items?.[index]?.product_id && (
                      <p className="text-xs text-destructive">{errors.items[index]?.product_id?.message}</p>
                    )}
                  </div>

                  {/* Quantity Expected */}
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Quantity Expected *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter quantity"
                      {...register(`items.${index}.quantity_expected`, { required: "Required" })}
                      disabled={!canEditItems}
                    />
                    {errors.items?.[index]?.quantity_expected && (
                      <p className="text-xs text-destructive">{errors.items[index]?.quantity_expected?.message}</p>
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
                createMutation.isPending || updateMutation.isPending ||
                (!shipment && !hasPermission("purchase-shipment:create")) ||
                (shipment !== null && !hasPermission("purchase-shipment:update"))
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
