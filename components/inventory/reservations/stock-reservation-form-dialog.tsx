"use client"

import type React from "react"
import { useState } from "react"
import { useCreateStockReservation } from "@/lib/hooks/use-stock-reservations"
import { useStockByLocation } from "@/lib/hooks/use-stock-by-location"
import { useWarehouses } from "@/lib/hooks/use-warehouses"
import { useShops } from "@/lib/hooks/use-shops"
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

export function StockReservationFormDialog({ open, onOpenChange }: StockReservationFormDialogProps) {
  const [formData, setFormData] = useState({
    productId: "",
    locationType: "warehouse" as "warehouse" | "shop",
    locationId: "",
    salesOrderId: "",
    quantity: "",
  })
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; available: number } | null>(null)

  const { hasPermission } = useAuth()
  const { data: warehouses } = useWarehouses()
  const { data: shops } = useShops()
  const { data: stockAtLocation } = useStockByLocation(formData.locationType, formData.locationId)
  const createMutation = useCreateStockReservation()

  const availableProducts =
    stockAtLocation
      ?.filter((stock) => stock.available > 0)
      .map((stock) => ({
        id: stock.product.id,
        name: `${stock.product.name} (${stock.product.sku})`,
        label: `${stock.product.name} - Available: ${stock.available}`,
        available: stock.available,
      })) || []

  const handleLocationChange = (value: string) => {
    setFormData({
      ...formData,
      locationId: value,
      productId: "",
    })
    setSelectedProduct(null)
  }

  const handleProductChange = (value: string) => {
    const product = availableProducts.find((p) => p.id === value)
    setFormData({ ...formData, productId: value })
    setSelectedProduct(product ? { id: value, available: product.available } : null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.locationId || !formData.productId || !formData.salesOrderId || !formData.quantity) {
      return
    }

    const quantity = Number.parseInt(formData.quantity, 10)
    if (selectedProduct && quantity > selectedProduct.available) {
      alert(`Cannot reserve more than available quantity (${selectedProduct.available})`)
      return
    }

    const data = {
      productId: formData.productId,
      salesOrderId: formData.salesOrderId,
      quantity: formData.quantity,
      ...(formData.locationType === "warehouse" && { warehouseId: formData.locationId }),
      ...(formData.locationType === "shop" && { shopId: formData.locationId }),
    }

    createMutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false)
        setFormData({
          productId: "",
          locationType: "warehouse",
          locationId: "",
          salesOrderId: "",
          quantity: "",
        })
        setSelectedProduct(null)
      },
    })
  }

  const warehouseOptions = (warehouses || []).map((w) => ({
    id: w.id,
    name: w.name,
    label: w.name,
  }))

  const shopOptions = (shops || []).map((s) => ({
    id: s.id,
    name: s.name,
    label: s.name,
  }))

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({
        productId: "",
        locationType: "warehouse",
        locationId: "",
        salesOrderId: "",
        quantity: "",
      })
      setSelectedProduct(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Stock Reservation</DialogTitle>
          <DialogDescription>Reserve stock for a sales order</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Location Type</Label>
            <Select
              value={formData.locationType}
              onValueChange={(value) => {
                setFormData({
                  ...formData,
                  locationType: value as "warehouse" | "shop",
                  locationId: "",
                  productId: "",
                })
                setSelectedProduct(null)
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
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <SearchableSelect
              value={formData.locationId}
              onValueChange={handleLocationChange}
              options={formData.locationType === "warehouse" ? warehouseOptions : shopOptions}
              placeholder="Select location"
              searchPlaceholder="Search locations..."
            />
          </div>

          {formData.locationId && (
            <div className="space-y-2">
              <Label>Product</Label>
              {availableProducts.length > 0 ? (
                <SearchableSelect
                  value={formData.productId}
                  onValueChange={handleProductChange}
                  options={availableProducts}
                  placeholder="Select product"
                  searchPlaceholder="Search products..."
                />
              ) : (
                <div className="text-sm text-muted-foreground p-2 border rounded">
                  No products with available stock at this location
                </div>
              )}
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
            <Input
              id="salesOrderId"
              placeholder="e.g., SO-2025-001"
              value={formData.salesOrderId}
              onChange={(e) => setFormData({ ...formData, salesOrderId: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity to Reserve</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={selectedProduct?.available}
              placeholder="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !hasPermission("stock.reservation:create") ||
                createMutation.isPending || !formData.locationId || !formData.productId || !formData.salesOrderId
              }
            >
              {createMutation.isPending ? "Creating..." : "Create Reservation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
