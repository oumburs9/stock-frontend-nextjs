"use client"

import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { useCreatePurchaseOrder, useUpdatePurchaseOrder } from "@/lib/hooks/use-purchase-orders"
import { useProducts } from "@/lib/hooks/use-products"
import { usePartners } from "@/lib/hooks/use-partners"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2 } from "lucide-react"
import { SearchableCombobox } from "@/components/shared/searchable-combobox"
import type { PurchaseOrder, CreatePurchaseOrderRequest } from "@/lib/types/purchase"
import { useAuth } from "@/lib/hooks/use-auth"

interface PurchaseOrderFormDialogProps {
  purchaseOrder: PurchaseOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PurchaseOrderFormDialog({ purchaseOrder, open, onOpenChange }: PurchaseOrderFormDialogProps) {
  const { toast } = useToast()
  const createMutation = useCreatePurchaseOrder()
  const updateMutation = useUpdatePurchaseOrder()
  const { data: products } = useProducts()
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
  } = useForm<CreatePurchaseOrderRequest>({
    defaultValues: {
      code: "",
      supplier_id: "",
      order_date: new Date().toISOString().split("T")[0],
      expected_date: null,
      currency: "ETB",
      notes: null,
      items: [{ product_id: "", quantity: "1", unit_price: "0" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  useEffect(() => {
    if (purchaseOrder) {
      reset({
        code: purchaseOrder.code,
        supplier_id: purchaseOrder.supplier_id,
        order_date: purchaseOrder.order_date,
        expected_date: purchaseOrder.expected_date || null,
        currency: purchaseOrder.currency || "ETB",
        notes: purchaseOrder.notes || null,
        items: purchaseOrder.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      })
    } else {
      reset({
        code: "",
        supplier_id: "",
        order_date: new Date().toISOString().split("T")[0],
        expected_date: null,
        currency: "ETB",
        notes: null,
        items: [{ product_id: "", quantity: "1", unit_price: "0" }],
      })
    }
  }, [purchaseOrder, reset])

  const onSubmit = async (data: CreatePurchaseOrderRequest) => {
    try {
      if (purchaseOrder) {
        await updateMutation.mutateAsync({
          id: purchaseOrder.id,
          data: {
            supplier_id: data.supplier_id,
            order_date: data.order_date,
            expected_date: data.expected_date,
            currency: data.currency,
            notes: data.notes ?? undefined,
            items: data.items,
          },
        })
        toast({
          title: "Success",
          description: "Purchase order updated successfully",
        })
      } else {
        await createMutation.mutateAsync(data)
        toast({
          title: "Success",
          description: "Purchase order created successfully",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{purchaseOrder ? "Edit Purchase Order" : "Create Purchase Order"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">PO Code *</Label>
              <Input
                id="code"
                {...register("code", { required: "Code is required" })}
                disabled={!!purchaseOrder}
                placeholder="PO-001"
              />
              {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
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
              />
              {errors.supplier_id && <p className="text-sm text-destructive">{errors.supplier_id.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order_date">Order Date *</Label>
              <Input id="order_date" type="date" {...register("order_date", { required: "Order date is required" })} />
              {errors.order_date && <p className="text-sm text-destructive">{errors.order_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_date">Expected Date</Label>
              <Input id="expected_date" type="date" {...register("expected_date")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Input
                id="currency"
                {...register("currency", { required: "Currency is required" })}
                placeholder="ETB"
                defaultValue="ETB"
              />
              {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Enter any additional notes..." rows={3} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Items *</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => append({ product_id: "", quantity: "1", unit_price: "0" })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start p-3 border rounded-md bg-muted/30">
                <div className="flex-1 space-y-2">
                  <Label className="text-xs text-muted-foreground">Product</Label>
                  <SearchableCombobox
                    value={watch(`items.${index}.product_id`)}
                    onChange={(value) => setValue(`items.${index}.product_id`, value)}
                    options={productOptions}
                    placeholder="Select product..."
                    searchPlaceholder="Search products..."
                    emptyMessage="No products found."
                  />
                  {errors.items?.[index]?.product_id && (
                    <p className="text-sm text-destructive">{errors.items[index]?.product_id?.message}</p>
                  )}
                </div>

                <div className="w-32 space-y-2">
                  <Label className="text-xs text-muted-foreground">Quantity</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Qty"
                    {...register(`items.${index}.quantity`, { required: "Required" })}
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-xs text-destructive">{errors.items[index]?.quantity?.message}</p>
                  )}
                </div>

                <div className="w-32 space-y-2">
                  <Label className="text-xs text-muted-foreground">Unit Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    {...register(`items.${index}.unit_price`, { required: "Required" })}
                  />
                  {errors.items?.[index]?.unit_price && (
                    <p className="text-xs text-destructive">{errors.items[index]?.unit_price?.message}</p>
                  )}
                </div>

                <div className="pt-6">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
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
                  (!purchaseOrder && !hasPermission("purchase-order:create")) ||
                  (purchaseOrder !== null && !hasPermission("purchase-order:update"))
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
