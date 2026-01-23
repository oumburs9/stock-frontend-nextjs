"use client"

import { useState, useMemo } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BatchTable } from "@/components/purchase/batches/batch-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchableCombobox } from "@/components/shared/searchable-combobox"
import { useProducts } from "@/lib/hooks/use-products"
import { usePurchaseOrders } from "@/lib/hooks/use-purchase-orders"
import { useShipments } from "@/lib/hooks/use-shipments"
import { Button } from "@/components/ui/button"
import { X, Search } from "lucide-react"
import { RequirePermission } from "@/components/auth/require-permission"

export default function BatchesPage() {
  const [globalSearch, setGlobalSearch] = useState("")
  const [productFilter, setProductFilter] = useState<string>("")
  const [shipmentFilter, setShipmentFilter] = useState<string>("")
  const [poFilter, setPoFilter] = useState<string>("")

  // console.log("[v0] BatchesPage - productFilter:", productFilter)
  // console.log("[v0] BatchesPage - setProductFilter type:", typeof setProductFilter)

  const { data: products } = useProducts()
  const { data: purchaseOrders } = usePurchaseOrders()
  const { data: shipments } = useShipments()

  // console.log("shipments: ", shipments)
  const productOptions = useMemo(
    () =>
      products?.map((p) => ({
        value: p.id,
        label: `${p.name} (${p.sku})`,
      })) || [],
    [products],
  )

  const shipmentOptions = useMemo(
    () =>
      shipments?.map((s) => ({
        value: s.id,
        label: s.code,
      })) || [],
    [shipments],
  )

  const poOptions = useMemo(
    () =>
      purchaseOrders?.map((po) => ({
        value: po.id,
        label: po.code,
      })) || [],
    [purchaseOrders],
  )

  const handleClearFilters = () => {
    setGlobalSearch("")
    setProductFilter("")
    setShipmentFilter("")
    setPoFilter("")
  }

  const hasActiveFilters = globalSearch || productFilter || shipmentFilter || poFilter

  return (
    <DashboardLayout>
      <RequirePermission permission="product-batch:view">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Batches</h1>
            <p className="text-muted-foreground">View all inventory batches with cost tracking and expense management</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Search & Filters</CardTitle>
              <CardDescription>Filter batches by product, shipment, or purchase order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="globalSearch">Global Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="globalSearch"
                    placeholder="Search by product name, shipment code, or PO code..."
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <SearchableCombobox
                    options={productOptions}
                    value={productFilter}
                    onChange={(val) => {
                      console.log("[v0] Product filter changed to:", val)
                      setProductFilter(val)
                    }}
                    placeholder="All products"
                    searchPlaceholder="Search products..."
                    emptyMessage="No products found"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Shipment</Label>
                  <SearchableCombobox
                    options={shipmentOptions}
                    value={shipmentFilter}
                    onChange={(val) => {
                      console.log("[v0] Shipment filter changed to:", val)
                      setShipmentFilter(val)
                    }}
                    placeholder="All shipments"
                    searchPlaceholder="Search shipments..."
                    emptyMessage="No shipments found"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Purchase Order</Label>
                  <SearchableCombobox
                    options={poOptions}
                    value={poFilter}
                    onChange={(val) => {
                      console.log("[v0] PO filter changed to:", val)
                      setPoFilter(val)
                    }}
                    placeholder="All purchase orders"
                    searchPlaceholder="Search POs..."
                    emptyMessage="No purchase orders found"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={handleClearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <BatchTable
            globalSearch={globalSearch}
            productFilter={productFilter}
            shipmentFilter={shipmentFilter}
            poFilter={poFilter}
          />
        </div>
      </RequirePermission>
    </DashboardLayout>
  )
}
