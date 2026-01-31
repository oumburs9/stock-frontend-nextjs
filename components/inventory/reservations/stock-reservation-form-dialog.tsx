"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import type { AxiosError } from "axios"

import { useCreateStockReservation } from "@/lib/hooks/use-stock-reservations"
import { useStockByLocation } from "@/lib/hooks/use-stock-by-location"
import { useWarehouses } from "@/lib/hooks/use-warehouses"
import { useShops } from "@/lib/hooks/use-shops"
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

interface StockReservationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type StockReservationFormValues = {
  locationType: "warehouse" | "shop"
  locationId: string
  productId: string
  salesOrderId: string
  quantity: string
}

export function StockReservationFormDialog({ open, onOpenChange }: StockReservationFormDialogProps) {
  const toast = useToast()

  const { hasPermission } = useAuth()
  const { data: warehouses } = useWarehouses()
  const { data: shops } = useShops()

  const createMutation = useCreateStockReservation()

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm<StockReservationFormValues>({
    defaultValues: {
      locationType: "warehouse",
      locationId: "",
      productId: "",
      salesOrderId: "",
      quantity: "",
    },
  })

  const [formError, setFormError] = useState<string | null>(null)

  const locationType = watch("locationType")
  const locationId = watch("locationId")
  const productId = watch("productId")

  const { data: stockAtLocation } = useStockByLocation(locationType, locationId)

  const availableProducts = useMemo(() => {
    return (
      stockAtLocation
        ?.filter((stock) => stock.available > 0)
        .map((stock) => ({
          id: stock.product.id,
          name: `${stock.product.name} (${stock.product.sku})`,
          label: `${stock.product.name} - Available: ${stock.available}`,
          available: stock.available,
        })) || []
    )
  }, [stockAtLocation])

  const selectedProduct = useMemo(() => {
    const product = availableProducts.find((p) => p.id === productId)
    return product ? { id: productId, available: product.available } : null
  }, [availableProducts, productId])

  const warehouseOptions = useMemo(
    () =>
      (warehouses || []).map((w) => ({
        id: w.id,
        name: w.name,
        label: w.name,
      })),
    [warehouses],
  )

  const shopOptions = useMemo(
    () =>
      (shops || []).map((s) => ({
        id: s.id,
        name: s.name,
        label: s.name,
      })),
    [shops],
  )

  useEffect(() => {
    if (!open) {
      setFormError(null)
      reset({
        locationType: "warehouse",
        locationId: "",
        productId: "",
        salesOrderId: "",
        quantity: "",
      })
    }
  }, [open, reset])

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormError(null)
      reset({
        locationType: "warehouse",
        locationId: "",
        productId: "",
        salesOrderId: "",
        quantity: "",
      })
    }
    onOpenChange(newOpen)
  }

  const onSubmit = (values: StockReservationFormValues) => {
    setFormError(null)

    const data = {
      productId: values.productId,
      salesOrderId: values.salesOrderId,
      quantity: values.quantity,
      ...(values.locationType === "warehouse" && { warehouseId: values.locationId }),
      ...(values.locationType === "shop" && { shopId: values.locationId }),
    }

    createMutation
      .mutateAsync(data)
      .then(() => {
        toast.success("Reservation created", "The reservation was created successfully.")
        handleOpenChange(false)
      })
      .catch((e: AxiosError) => {
        const parsed = parseApiError(e)

        if (parsed.type === "validation") {
          Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof StockReservationFormValues, { message })
          })
          if (parsed.formError) setFormError(parsed.formError)
          return
        }

        showApiErrorToast(parsed, toast, "Failed to create reservation.")
      })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Stock Reservation</DialogTitle>
          <DialogDescription>Reserve stock for a sales order</DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Location Type</Label>
            <Controller
              control={control}
              name="locationType"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value as "warehouse" | "shop")
                    reset(
                      {
                        locationType: value as "warehouse" | "shop",
                        locationId: "",
                        productId: "",
                        salesOrderId: watch("salesOrderId"),
                        quantity: watch("quantity"),
                      },
                      { keepErrors: true },
                    )
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="shop">Shop</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.locationType?.message && <p className="text-sm text-destructive">{errors.locationType.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Controller
              control={control}
              name="locationId"
              render={({ field }) => (
                <SearchableSelect
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    reset(
                      {
                        locationType: watch("locationType"),
                        locationId: value,
                        productId: "",
                        salesOrderId: watch("salesOrderId"),
                        quantity: watch("quantity"),
                      },
                      { keepErrors: true },
                    )
                  }}
                  options={locationType === "warehouse" ? warehouseOptions : shopOptions}
                  placeholder="Select location"
                  searchPlaceholder="Search locations..."
                />
              )}
            />
            {errors.locationId?.message && <p className="text-sm text-destructive">{errors.locationId.message}</p>}
          </div>

          {locationId && (
            <div className="space-y-2">
              <Label>Product</Label>
              {availableProducts.length > 0 ? (
                <Controller
                  control={control}
                  name="productId"
                  render={({ field }) => (
                    <SearchableSelect
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                      options={availableProducts}
                      placeholder="Select product"
                      searchPlaceholder="Search products..."
                    />
                  )}
                />
              ) : (
                <div className="text-sm text-muted-foreground p-2 border rounded">
                  No products with available stock at this location
                </div>
              )}
              {errors.productId?.message && <p className="text-sm text-destructive">{errors.productId.message}</p>}
            </div>
          )}

          {selectedProduct && (
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded text-sm">
              <div className="text-muted-foreground">Available Quantity</div>
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{selectedProduct.available}</div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="salesOrderId">Sales Order ID</Label>
            <Input id="salesOrderId" placeholder="e.g., SO-2025-001" {...register("salesOrderId")} />
            {errors.salesOrderId?.message && <p className="text-sm text-destructive">{errors.salesOrderId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity to Reserve</Label>
            <Input id="quantity" type="number" placeholder="0" {...register("quantity")} />
            {errors.quantity?.message && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!hasPermission("stock.reservation:create") || createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Reservation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
