"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { usePriceQuote } from "@/lib/hooks/use-sales"
import { useProducts } from "@/lib/hooks/use-products"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { SearchableCombobox } from "@/components/shared/searchable-combobox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, Package } from "lucide-react"

export default function PriceQuotePage() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [asOfDate, setAsOfDate] = useState("")
  const { data: products } = useProducts()
  const { data: priceQuote, refetch, isLoading } = usePriceQuote(selectedProductId, asOfDate || undefined)

  const productOptions =
    products?.map((product) => ({
      value: product.id,
      label: `${product.name} (${product.sku})`,
    })) || []

  const selectedProduct = products?.find((p) => p.id === selectedProductId)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Price Quote Tool</h1>
          <p className="text-muted-foreground">Get suggested selling prices based on cost and pricing rules</p>
        </div>

        {/* Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle>Select Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Product *</Label>
              <SearchableCombobox
                value={selectedProductId || ""}
                onChange={setSelectedProductId}
                options={productOptions}
                placeholder="Select product..."
                searchPlaceholder="Search products..."
                emptyMessage="No products found."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asOfDate">As of Date (Optional)</Label>
              <Input
                id="asOfDate"
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                placeholder="Leave blank for current date"
              />
              <p className="text-sm text-muted-foreground">
                View pricing as of a specific date (uses rules valid at that time)
              </p>
            </div>

            <Button onClick={() => refetch()} disabled={!selectedProductId || isLoading} className="w-full">
              <DollarSign className="mr-2 h-4 w-4" />
              {isLoading ? "Loading..." : "Get Price Quote"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Card */}
        {priceQuote && selectedProduct && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Suggested Selling Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">
                  ${Number.parseFloat(priceQuote.listPrice).toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">Per unit</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unit Cost:</span>
                  <span className="font-semibold">${Number.parseFloat(priceQuote.unitCost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost Basis:</span>
                  <span className="text-sm">{priceQuote.costBasis.replace(/_/g, " ")}</span>
                </div>
                {priceQuote.appliedMarginPercent && (
                  <>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Applied Margin:</span>
                      <span className="flex items-center gap-1 text-green-600 font-semibold">
                        <TrendingUp className="h-4 w-4" />
                        {priceQuote.appliedMarginPercent}%
                      </span>
                    </div>
                  </>
                )}
                {priceQuote.pricingRuleId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pricing Rule:</span>
                    <span className="font-mono text-xs">{priceQuote.pricingRuleId.slice(0, 8)}...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 md:grid-cols-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{selectedProduct.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="font-mono text-sm">{selectedProduct.sku}</span>
                </div>
                {selectedProduct.description && (
                  <div className="md:col-span-2">
                    <span className="text-muted-foreground">Description:</span>
                    <p className="text-sm mt-1">{selectedProduct.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {!priceQuote && !isLoading && selectedProductId && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Click "Get Price Quote" to see the suggested selling price
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
