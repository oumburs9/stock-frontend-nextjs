"use client"

import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useUpdateSalesOrderItem } from "@/lib/hooks/use-sales"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils/currency"
import type { UpdateSalesOrderItemRequest, SalesOrderItem } from "@/lib/types/sales"
import { useAuth } from "@/lib/hooks/use-auth"

interface EditSalesOrderItemDialogProps {
  salesOrderId: string
  item: SalesOrderItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditSalesOrderItemDialog({ salesOrderId, item, open, onOpenChange }: EditSalesOrderItemDialogProps) {
  const { toast } = useToast()
  const updateItemMutation = useUpdateSalesOrderItem()
  const { hasPermission } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<UpdateSalesOrderItemRequest>({
    defaultValues: {
      // quantity: item.quantity,
      unitPrice: item.unit_price,
      discountAmount: item.discount_amount,
      discountPercent: item.discount_percent,
    },
  })

  const discountAmount = useWatch({ control, name: "discountAmount" })
  const discountPercent = useWatch({ control, name: "discountPercent" })

  useEffect(() => {
    if (item) {
      reset({
        // quantity: item.quantity,
        unitPrice: item.unit_price,
        discountAmount: item.discount_amount,
        discountPercent: item.discount_percent,
      })
    }
  }, [item, reset])

  useEffect(() => {
    const listPrice = Number.parseFloat(item.list_price)
    let newUnitPrice = listPrice

    if (discountAmount && Number.parseFloat(discountAmount) > 0) {
      // Apply discount amount
      newUnitPrice = listPrice - Number.parseFloat(discountAmount)
    } else if (discountPercent && Number.parseFloat(discountPercent) > 0) {
      // Apply discount percent
      newUnitPrice = listPrice * (1 - Number.parseFloat(discountPercent) / 100)
    }

    setValue("unitPrice", newUnitPrice.toFixed(6))
  }, [discountAmount, discountPercent, item.list_price, setValue])

  const onSubmit = async (data: UpdateSalesOrderItemRequest) => {
    try {
      await updateItemMutation.mutateAsync({
        orderId: salesOrderId,
        itemId: item.id,
        data,
      })
      toast({
        title: "Success",
        description: "Item updated successfully",
      })
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update item",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Item Price</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Original List Price</Label>
              <p className="text-sm text-muted-foreground">
                Quantity cannot be changed after an item is added. Remove and re-add the item to change quantity.
              </p>
            <div className="text-2xl font-bold">{formatCurrency(Number.parseFloat(item.list_price))}</div>
          </div>

          {/* <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              {...register("quantity", { required: "Quantity is required" })}
            />
            {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
          </div> */}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountAmount">Discount Amount</Label>
              <Input id="discountAmount" type="number" step="0.01" {...register("discountAmount")} />
              <p className="text-xs text-muted-foreground">Fixed discount in currency</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountPercent">Discount %</Label>
              <Input id="discountPercent" type="number" step="0.01" {...register("discountPercent")} />
              <p className="text-xs text-muted-foreground">Percentage off list price</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitPrice">Final Unit Price</Label>
            <Input
              id="unitPrice"
              type="number"
              step="0.000001"
              {...register("unitPrice", { required: "Unit price is required" })}
              className="font-mono text-lg"
            />
            <p className="text-xs text-muted-foreground">Calculated automatically from discount, or enter manually</p>
            {errors.unitPrice && <p className="text-sm text-destructive">{errors.unitPrice.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateItemMutation.isPending || !hasPermission('sales-order-item:update')}>
              {updateItemMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
