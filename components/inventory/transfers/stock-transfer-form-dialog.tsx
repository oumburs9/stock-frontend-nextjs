"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import type { AxiosError } from "axios"

import { useCreateStockTransfer } from "@/lib/hooks/use-stock-transfers"
import { useProducts } from "@/lib/hooks/use-products"
import { useWarehouses } from "@/lib/hooks/use-warehouses"
import { useShops } from "@/lib/hooks/use-shops"
import { useStockByLocation } from "@/lib/hooks/use-stock-by-location"

import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"
import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchableSelect } from "@/components/shared/searchable-select"
import { useAuth } from "@/lib/hooks/use-auth"

type StockTransferFormValues = {
  productId: string
  fromLocationType: "warehouse" | "shop"
  fromLocationId: string
  toLocationType: "warehouse" | "shop"
  toLocationId: string
  quantity: string
  reason: string
}

interface StockTransferFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StockTransferFormDialog({ open, onOpenChange }: StockTransferFormDialogProps) {
  const toast = useToast()
  const { hasPermission } = useAuth()

  const createMutation = useCreateStockTransfer()
  const { data: warehouses } = useWarehouses()
  const { data: shops } = useShops()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<StockTransferFormValues>({
    defaultValues: {
      productId: "",
      fromLocationType: "warehouse",
      fromLocationId: "",
      toLocationType: "warehouse",
      toLocationId: "",
      quantity: "",
      reason: "",
    },
  })

  useEffect(() => {
    if (!open) {
      reset({
        productId: "",
        fromLocationType: "warehouse",
        fromLocationId: "",
        toLocationType: "warehouse",
        toLocationId: "",
        quantity: "",
        reason: "",
      })
    }
  }, [open, reset])

  const fromLocationType = watch("fromLocationType")
  const fromLocationId = watch("fromLocationId")
  const toLocationType = watch("toLocationType")

  const { data: stockAtFromLocation } = useStockByLocation(fromLocationType, fromLocationId)

  const availableProducts =
    stockAtFromLocation?.map((stock) => ({
      id: stock.product.id,
      name: `${stock.product.name} (${stock.product.sku})`,
      label: `${stock.product.name} - Available: ${stock.available}`,
    })) || []

  const warehouseOptions =
    warehouses?.map((w) => ({ id: w.id, name: w.name, label: w.name })) || []

  const shopOptions =
    shops?.map((s) => ({ id: s.id, name: s.name, label: s.name })) || []

  const onSubmit = (values: StockTransferFormValues) => {
    createMutation
      .mutateAsync(values)
      .then(() => {
        toast.success("Stock transfer created")
        onOpenChange(false)
      })
      .catch((e: AxiosError) => {
        const parsed = parseApiError(e)

        if (parsed.type === "validation") {
          Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof StockTransferFormValues, { message })
          })
          return
        }

        showApiErrorToast(parsed, toast)
      })
  }

  const isPending = createMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Stock Transfer</DialogTitle>
          <DialogDescription>Move stock between warehouses and shops</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>From Location Type</Label>
            <Select
              value={fromLocationType}
              onValueChange={(value) =>
                reset({
                  ...watch(),
                  fromLocationType: value as any,
                  fromLocationId: "",
                  productId: "",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="shop">Shop</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>From Location</Label>
            <SearchableSelect
              value={fromLocationId}
              onValueChange={(value) =>
                reset({ ...watch(), fromLocationId: value, productId: "" })
              }
              options={fromLocationType === "warehouse" ? warehouseOptions : shopOptions}
              placeholder="Select location"
              searchPlaceholder="Search locations..."
            />
            {errors.fromLocationId?.message && (
              <p className="text-sm text-destructive">{errors.fromLocationId.message}</p>
            )}
          </div>

          {fromLocationId && (
            <div className="space-y-2">
              <Label>Product</Label>
              <SearchableSelect
                value={watch("productId")}
                onValueChange={(value) =>
                  reset({ ...watch(), productId: value })
                }
                options={availableProducts}
                placeholder="Select product"
                searchPlaceholder="Search products..."
              />
              {errors.productId?.message && (
                <p className="text-sm text-destructive">{errors.productId.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>To Location Type</Label>
            <Select
              value={toLocationType}
              onValueChange={(value) =>
                reset({
                  ...watch(),
                  toLocationType: value as any,
                  toLocationId: "",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warehouse">Warehouse</SelectItem>
                <SelectItem value="shop">Shop</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>To Location</Label>
            <SearchableSelect
              value={watch("toLocationId")}
              onValueChange={(value) =>
                reset({ ...watch(), toLocationId: value })
              }
              options={toLocationType === "warehouse" ? warehouseOptions : shopOptions}
              placeholder="Select location"
              searchPlaceholder="Search locations..."
            />
            {errors.toLocationId?.message && (
              <p className="text-sm text-destructive">{errors.toLocationId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input type="number" {...register("quantity")} />
            {errors.quantity?.message && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Select
              value={watch("reason")}
              onValueChange={(value) =>
                reset({ ...watch(), reason: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="replenish_retail_stock">Replenish Retail Stock</SelectItem>
                <SelectItem value="stock_rebalance">Stock Rebalance</SelectItem>
                <SelectItem value="seasonal_stock_move">Seasonal Stock Move</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.reason?.message && (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!hasPermission("stock.transfer:create") || isPending}
            >
              {isPending ? "Creating..." : "Create Transfer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
