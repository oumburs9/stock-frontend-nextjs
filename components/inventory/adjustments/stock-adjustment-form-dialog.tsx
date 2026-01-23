"use client"

import type React from "react"
import { useState } from "react"
import { useCreateStockAdjustment } from "@/lib/hooks/use-stock-adjustments"
import { useProducts } from "@/lib/hooks/use-products"
import { useWarehouses } from "@/lib/hooks/use-warehouses"
import { useShops } from "@/lib/hooks/use-shops"
import { useStockByLocation } from "@/lib/hooks/use-stock-by-location"
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

interface StockAdjustmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StockAdjustmentFormDialog({ open, onOpenChange }: StockAdjustmentFormDialogProps) {
  const [formData, setFormData] = useState({
    productId: "",
    locationType: "warehouse" as const,
    locationId: "",
    direction: "in" as const,
    quantity: "",
    reason: "",
  })

  const { hasPermission }  = useAuth()
  const { data: products } = useProducts()
  const { data: warehouses } = useWarehouses()
  const { data: shops } = useShops()
  const { data: stockAtLocation } = useStockByLocation(formData.locationType, formData.locationId)
  const createMutation = useCreateStockAdjustment()

  const availableProducts =
    stockAtLocation?.map((stock) => ({
      id: stock.product.id,
      name: `${stock.product.name} (${stock.product.sku}) - On Hand: ${stock.onHand}`,
      label: `${stock.product.name} - On Hand: ${stock.onHand}`,
    })) || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    createMutation.mutate(formData, {
      onSuccess: () => {
        onOpenChange(false)
        setFormData({
          productId: "",
          locationType: "warehouse",
          locationId: "",
          direction: "in",
          quantity: "",
          reason: "",
        })
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Stock Adjustment</DialogTitle>
          <DialogDescription>Adjust stock quantities for a product at a location</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Location Type</Label>
            <Select
              value={formData.locationType}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
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
              value={formData.locationId}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  locationId: value,
                  productId: "",
                })
              }
              options={formData.locationType === "warehouse" ? warehouseOptions : shopOptions}
              placeholder="Select location"
              searchPlaceholder="Search locations..."
            />
          </div>

          {formData.locationId && (
            <div className="space-y-2">
              <Label>Product</Label>
              <SearchableSelect
                value={formData.productId}
                onValueChange={(value) => setFormData({ ...formData, productId: value })}
                options={availableProducts}
                placeholder="Select product"
                searchPlaceholder="Search products..."
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Direction</Label>
              <Select
                value={formData.direction}
                onValueChange={(value) => setFormData({ ...formData, direction: value as any })}
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
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Select value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="year_end_reconciliation">Year End Reconciliation</SelectItem>
                <SelectItem value="inventory_count_variance">Inventory Count Variance</SelectItem>
                <SelectItem value="damage_replacement">Damage Replacement</SelectItem>
                <SelectItem value="theft_loss">Theft/Loss</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!hasPermission("stock.adjustment:create") || createMutation.isPending || !formData.locationId || !formData.productId}>
              {createMutation.isPending ? "Creating..." : "Create Adjustment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
