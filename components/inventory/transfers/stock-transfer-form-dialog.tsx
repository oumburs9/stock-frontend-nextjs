"use client"

import type React from "react"
import { useState } from "react"
import { useCreateStockTransfer } from "@/lib/hooks/use-stock-transfers"
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

interface StockTransferFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StockTransferFormDialog({ open, onOpenChange }: StockTransferFormDialogProps) {
  const [formData, setFormData] = useState({
    productId: "",
    fromLocationType: "warehouse" as const,
    fromLocationId: "",
    toLocationType: "warehouse" as const,
    toLocationId: "",
    quantity: "",
    reason: "",
  })

  const { data: products } = useProducts()
  const { data: warehouses } = useWarehouses()
  const { data: shops } = useShops()
  const { data: stockAtFromLocation } = useStockByLocation(formData.fromLocationType, formData.fromLocationId)
  const createMutation = useCreateStockTransfer()

  const availableProducts =
    stockAtFromLocation?.map((stock) => ({
      id: stock.product.id,
      name: `${stock.product.name} (${stock.product.sku}) - Available: ${stock.available}`,
      label: `${stock.product.name} - Available: ${stock.available}`,
    })) || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    createMutation.mutate(formData, {
      onSuccess: () => {
        onOpenChange(false)
        setFormData({
          productId: "",
          fromLocationType: "warehouse",
          fromLocationId: "",
          toLocationType: "warehouse",
          toLocationId: "",
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
          <DialogTitle>Create Stock Transfer</DialogTitle>
          <DialogDescription>Move stock between warehouses and shops</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fromLocationType">From Location Type</Label>
            <Select
              value={formData.fromLocationType}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
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
            <Label htmlFor="fromLocationId">From Location</Label>
            <SearchableSelect
              value={formData.fromLocationId}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  fromLocationId: value,
                  productId: "",
                })
              }
              options={formData.fromLocationType === "warehouse" ? warehouseOptions : shopOptions}
              placeholder="Select location"
              searchPlaceholder="Search locations..."
            />
          </div>

          {formData.fromLocationId && (
            <div className="space-y-2">
              <Label htmlFor="productId">Product</Label>
              <SearchableSelect
                value={formData.productId}
                onValueChange={(value) => setFormData({ ...formData, productId: value })}
                options={availableProducts}
                placeholder="Select product"
                searchPlaceholder="Search products..."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="toLocationType">To Location Type</Label>
            <Select
              value={formData.toLocationType}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
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
            <Label htmlFor="toLocationId">To Location</Label>
            <SearchableSelect
              value={formData.toLocationId}
              onValueChange={(value) => setFormData({ ...formData, toLocationId: value })}
              options={formData.toLocationType === "warehouse" ? warehouseOptions : shopOptions}
              placeholder="Select location"
              searchPlaceholder="Search locations..."
            />
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

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Select value={formData.reason} onValueChange={(value) => setFormData({ ...formData, reason: value })}>
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !formData.fromLocationId || !formData.productId}
            >
              {createMutation.isPending ? "Creating..." : "Create Transfer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
