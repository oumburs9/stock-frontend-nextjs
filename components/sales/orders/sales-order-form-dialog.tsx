"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useCreateSalesOrder, useUpdateSalesOrder } from "@/lib/hooks/use-sales"
import { usePartners } from "@/lib/hooks/use-partners"
import { useWarehouses } from "@/lib/hooks/use-warehouses"
import { useShops } from "@/lib/hooks/use-shops"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { SearchableCombobox } from "@/components/shared/searchable-combobox"
import type { SalesOrder, CreateSalesOrderRequest } from "@/lib/types/sales"
import { useAuth } from "@/lib/hooks/use-auth"

interface SalesOrderFormDialogProps {
  salesOrder: SalesOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SalesOrderFormDialog({ salesOrder, open, onOpenChange }: SalesOrderFormDialogProps) {
  const { toast } = useToast()
  const createMutation = useCreateSalesOrder()
  const updateMutation = useUpdateSalesOrder()
  const { data: customers } = usePartners("customer")
  const { data: warehouses } = useWarehouses()
  const { data: shops } = useShops()
  const [locationType, setLocationType] = useState<"warehouse" | "shop">("warehouse")
  const { hasPermission } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateSalesOrderRequest>({
    defaultValues: {
      customerId: "",
      warehouseId: undefined,
      shopId: undefined,
      orderDate: new Date().toISOString().split("T")[0],
      currency: "ETB",
      paymentTerms: "cash",
      notes: null,
    },
  })

  useEffect(() => {
    if (salesOrder) {
      if (salesOrder.warehouse_id) {
        setLocationType("warehouse")
      } else if (salesOrder.shop_id) {
        setLocationType("shop")
      }
      reset({
        customerId: salesOrder.customer_id,
        warehouseId: salesOrder.warehouse_id || undefined,
        shopId: salesOrder.shop_id || undefined,
        orderDate: salesOrder.order_date,
        currency: salesOrder.currency || "ETB",
        paymentTerms: salesOrder.payment_terms || "cash",
        notes: salesOrder.notes || null,
      })
    } else {
      reset({
        customerId: "",
        warehouseId: undefined,
        shopId: undefined,
        orderDate: new Date().toISOString().split("T")[0],
        currency: "ETB",
        paymentTerms: "cash",
        notes: null,
      })
      setLocationType("warehouse")
    }
  }, [salesOrder, reset])

  const onSubmit = async (data: CreateSalesOrderRequest) => {
    try {
      const payload: CreateSalesOrderRequest = {
        ...data,
        warehouseId: locationType === "warehouse" ? data.warehouseId : undefined,
        shopId: locationType === "shop" ? data.shopId : undefined,
      }

      if (salesOrder) {
        await updateMutation.mutateAsync({
          id: salesOrder.id,
          data: payload,
        })
        toast({
          title: "Success",
          description: "Sales order updated successfully",
        })
      } else {
        await createMutation.mutateAsync(payload)
        toast({
          title: "Success",
          description: "Sales order created successfully",
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

  const customerOptions =
    customers?.map((customer) => ({
      value: customer.id,
      label: customer.name,
    })) || []

  const warehouseOptions =
    warehouses?.map((warehouse) => ({
      value: warehouse.id,
      label: warehouse.name,
    })) || []

  const shopOptions =
    shops?.map((shop) => ({
      value: shop.id,
      label: shop.name,
    })) || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{salesOrder ? "Edit Sales Order" : "Create Sales Order"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Customer *</Label>
            <SearchableCombobox
              value={watch("customerId")}
              onChange={(value) => setValue("customerId", value)}
              options={customerOptions}
              placeholder="Select customer..."
              searchPlaceholder="Search customers..."
              emptyMessage="No customers found."
            />
            {errors.customerId && <p className="text-sm text-destructive">{errors.customerId.message}</p>}
          </div>

          <div className="space-y-3">
            <Label>Selling Location *</Label>
            <Select value={locationType} onValueChange={(value) => setLocationType(value as "warehouse" | "shop")}>
              <SelectTrigger>
                <SelectValue placeholder="Select location type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="shop">Shop</SelectItem>
              </SelectContent>
            </Select>

            {locationType === "warehouse" && (
              <SearchableCombobox
                value={watch("warehouseId") || ""}
                onChange={(value) => setValue("warehouseId", value)}
                options={warehouseOptions}
                placeholder="Select warehouse..."
                searchPlaceholder="Search warehouses..."
                emptyMessage="No warehouses found."
              />
            )}

            {locationType === "shop" && (
              <SearchableCombobox
                value={watch("shopId") || ""}
                onChange={(value) => setValue("shopId", value)}
                options={shopOptions}
                placeholder="Select shop..."
                searchPlaceholder="Search shops..."
                emptyMessage="No shops found."
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderDate">Order Date *</Label>
              <Input id="orderDate" type="date" {...register("orderDate", { required: "Order date is required" })} />
              {errors.orderDate && <p className="text-sm text-destructive">{errors.orderDate.message}</p>}
            </div>

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
            <Label htmlFor="paymentTerms">Payment Terms *</Label>
            <Input
              id="paymentTerms"
              {...register("paymentTerms", { required: "Payment terms required" })}
              placeholder="cash, credit, etc."
            />
            {errors.paymentTerms && <p className="text-sm text-destructive">{errors.paymentTerms.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Enter any additional notes..." rows={3} />
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
