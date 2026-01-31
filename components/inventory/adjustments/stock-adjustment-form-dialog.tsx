"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import type { AxiosError } from "axios"

import { useCreateStockAdjustment } from "@/lib/hooks/use-stock-adjustments"
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

type StockAdjustmentFormValues = {
  productId: string
  locationType: "warehouse" | "shop"
  locationId: string
  direction: "in" | "out"
  quantity: string
  reason: string
}

interface StockAdjustmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StockAdjustmentFormDialog({
  open,
  onOpenChange,
}: StockAdjustmentFormDialogProps) {
  const toast = useToast()
  const { hasPermission } = useAuth()
  const createMutation = useCreateStockAdjustment()

  const { data: warehouses } = useWarehouses()
  const { data: shops } = useShops()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<StockAdjustmentFormValues>({
    defaultValues: {
      productId: "",
      locationType: "warehouse",
      locationId: "",
      direction: "in",
      quantity: "",
      reason: "",
    },
  })

  useEffect(() => {
    if (!open) {
      reset({
        productId: "",
        locationType: "warehouse",
        locationId: "",
        direction: "in",
        quantity: "",
        reason: "",
      })
    }
  }, [open, reset])

  const locationType = watch("locationType")
  const locationId = watch("locationId")

  const { data: stockAtLocation } = useStockByLocation(locationType, locationId)

  const availableProducts =
    stockAtLocation?.map((stock) => ({
      id: stock.product.id,
      name: `${stock.product.name} (${stock.product.sku})`,
      label: `${stock.product.name} - On Hand: ${stock.onHand}`,
    })) || []

  const warehouseOptions =
    warehouses?.map((w) => ({ id: w.id, name: w.name, label: w.name })) || []

  const shopOptions =
    shops?.map((s) => ({ id: s.id, name: s.name, label: s.name })) || []

  const onSubmit = (values: StockAdjustmentFormValues) => {
    createMutation
      .mutateAsync(values)
      .then(() => {
        toast.success("Stock adjustment created")
        onOpenChange(false)
      })
      .catch((e: AxiosError) => {
        const parsed = parseApiError(e)

        if (parsed.type === "validation") {
          Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof StockAdjustmentFormValues, { message })
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
          <DialogTitle>Create Stock Adjustment</DialogTitle>
          <DialogDescription>
            Adjust stock quantities for a product at a location
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Location Type</Label>
            <Select
              value={locationType}
              onValueChange={(value) =>
                reset({
                  ...watch(),
                  locationType: value as any,
                  locationId: "",
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
            <Label>Location</Label>
            <SearchableSelect
              value={locationId}
              onValueChange={(value) =>
                reset({ ...watch(), locationId: value, productId: "" })
              }
              options={locationType === "warehouse" ? warehouseOptions : shopOptions}
              placeholder="Select location"
              searchPlaceholder="Search locations..."
            />
            {errors.locationId?.message && (
              <p className="text-sm text-destructive">{errors.locationId.message}</p>
            )}
          </div>

          {locationId && (
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Direction</Label>
              <Select
                value={watch("direction")}
                onValueChange={(value) =>
                  reset({ ...watch(), direction: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">IN (Add)</SelectItem>
                  <SelectItem value="out">OUT (Remove)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" {...register("quantity")} />
              {errors.quantity?.message && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>
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
                <SelectItem value="year_end_reconciliation">
                  Year End Reconciliation
                </SelectItem>
                <SelectItem value="inventory_count_variance">
                  Inventory Count Variance
                </SelectItem>
                <SelectItem value="damage_replacement">
                  Damage Replacement
                </SelectItem>
                <SelectItem value="theft_loss">Theft/Loss</SelectItem>
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
              disabled={!hasPermission("stock.adjustment:create") || isPending}
            >
              {isPending ? "Creating..." : "Create Adjustment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
