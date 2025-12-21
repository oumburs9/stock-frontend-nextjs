"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useAddSalesOrderItem, usePriceQuote } from "@/lib/hooks/use-sales"
import { useProducts } from "@/lib/hooks/use-products"
import { useStockByLocation } from "@/lib/hooks/use-stock-by-location"
import { useTaxConfig, useTaxRules } from "@/lib/hooks/use-finance"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchableCombobox } from "@/components/shared/searchable-combobox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TrendingUp, Info, Tag, Package, AlertTriangle, CheckCircle2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import type { AddSalesOrderItemRequest } from "@/lib/types/sales"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface AddSalesOrderItemDialogProps {
  salesOrderId: string
  warehouseId: string | null
  shopId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddSalesOrderItemDialog({
  salesOrderId,
  warehouseId,
  shopId,
  open,
  onOpenChange,
}: AddSalesOrderItemDialogProps) {
  const { toast } = useToast()
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [manualPriceEdit, setManualPriceEdit] = useState(false)
  const [selectedTaxRuleId, setSelectedTaxRuleId] = useState<string | null>(null)

  const { data: products } = useProducts()
  const { data: priceQuote } = usePriceQuote(selectedProductId)
  const addItemMutation = useAddSalesOrderItem()

  const locationType = warehouseId ? "warehouse" : "shop"
  const locationId = warehouseId || shopId
  const { data: stockByLocation } = useStockByLocation(locationType, locationId)

  const { data: taxConfig } = useTaxConfig()
  const { data: taxRules } = useTaxRules()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<AddSalesOrderItemRequest>({
    defaultValues: {
      productId: "",
      quantity: "1",
      unitPrice: undefined,
      discountAmount: "0",
      discountPercent: "0",
    },
  })

  const discountAmount = useWatch({ control, name: "discountAmount" })
  const discountPercent = useWatch({ control, name: "discountPercent" })
  const unitPrice = useWatch({ control, name: "unitPrice" })
  const quantity = useWatch({ control, name: "quantity" })

  const selectedProductStock = useMemo(() => {
    if (!selectedProductId || !stockByLocation) return null
    return stockByLocation.find((s) => s.productId === selectedProductId)
  }, [selectedProductId, stockByLocation])

  const productOptions = useMemo(() => {
    if (!products) return []

    return products.map((product) => {
      const stock = stockByLocation?.find((s) => s.productId === product.id)
      const available = stock?.available || 0

      let stockLabel = ""
      if (stock) {
        stockLabel = ` • Available: ${available}`
      }

      return {
        value: product.id,
        label: `${product.name} (${product.sku})${stockLabel}`,
      }
    })
  }, [products, stockByLocation])

  const applicableTaxRule = useMemo(() => {
    if (!taxConfig?.is_enabled) return null
    if (selectedTaxRuleId) {
      return taxRules?.find((r) => r.id === selectedTaxRuleId) || null
    }
    if (taxConfig.default_tax_rule_id) {
      return taxRules?.find((r) => r.id === taxConfig.default_tax_rule_id) || null
    }
    return null
  }, [taxConfig, taxRules, selectedTaxRuleId])

  const calculatedAmounts = useMemo(() => {
    const qty = Number.parseFloat(quantity || "0")
    const price = Number.parseFloat(unitPrice || "0")
    const subtotal = qty * price

    let taxAmount = 0
    if (applicableTaxRule) {
      const taxRate = Number.parseFloat(applicableTaxRule.rate)
      taxAmount = subtotal * (taxRate / 100)
    }

    const total = subtotal + taxAmount

    return { subtotal, taxAmount, total }
  }, [quantity, unitPrice, applicableTaxRule])

  useEffect(() => {
    if (!priceQuote?.listPrice) return

    if (manualPriceEdit) return

    const listPrice = Number.parseFloat(priceQuote.listPrice)
    let newUnitPrice = listPrice

    if (discountAmount && Number.parseFloat(discountAmount) > 0) {
      newUnitPrice = listPrice - Number.parseFloat(discountAmount)
    } else if (discountPercent && Number.parseFloat(discountPercent) > 0) {
      newUnitPrice = listPrice * (1 - Number.parseFloat(discountPercent) / 100)
    }

    setValue("unitPrice", newUnitPrice.toFixed(6))
  }, [discountAmount, discountPercent, priceQuote, manualPriceEdit, setValue])

  useEffect(() => {
    setManualPriceEdit(false)
  }, [selectedProductId])

  useEffect(() => {
    setSelectedTaxRuleId(null)
  }, [selectedProductId])

  const onSubmit = async (data: AddSalesOrderItemRequest) => {
    if (selectedProductStock) {
      const requestedQty = Number.parseFloat(data.quantity)
      if (requestedQty > selectedProductStock.available) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${selectedProductStock.available} units available at this location`,
          variant: "destructive",
        })
        return
      }
    }

    try {
      await addItemMutation.mutateAsync({
        orderId: salesOrderId,
        data: {
          ...data,
          productId: selectedProductId!,
        },
      })
      toast({
        title: "Success",
        description: "Item added to sales order successfully",
      })
      onOpenChange(false)
      reset()
      setSelectedProductId(null)
      setManualPriceEdit(false)
      setSelectedTaxRuleId(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add item",
        variant: "destructive",
      })
    }
  }

  const useSuggestedPrice = () => {
    if (priceQuote?.listPrice) {
      const listPrice = Number.parseFloat(priceQuote.listPrice)
      setValue("unitPrice", listPrice.toFixed(6))
      setValue("discountAmount", "0")
      setValue("discountPercent", "0")
      setManualPriceEdit(false)
    }
  }

  const activeTaxRules = useMemo(() => {
    return taxRules?.filter((r) => r.is_active) || []
  }, [taxRules])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Order Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Product *</Label>
            <SearchableCombobox
              value={selectedProductId || ""}
              onChange={(value) => {
                setSelectedProductId(value)
                setValue("productId", value)
              }}
              options={productOptions}
              placeholder="Select product..."
              searchPlaceholder="Search products..."
              emptyMessage="No products found."
            />
            {errors.productId && <p className="text-sm text-destructive">{errors.productId.message}</p>}
          </div>

          {selectedProductStock && (
            <Card
              className={cn(
                "border-2",
                selectedProductStock.available > 10 && "border-green-500/50 bg-green-50/50",
                selectedProductStock.available > 0 &&
                  selectedProductStock.available <= 10 &&
                  "border-yellow-500/50 bg-yellow-50/50",
                selectedProductStock.available === 0 && "border-red-500/50 bg-red-50/50",
              )}
            >
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Stock at {locationType === "warehouse" ? "Warehouse" : "Shop"}
                  </span>
                  <div className="flex items-center gap-2">
                    {selectedProductStock.available > 10 && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    {selectedProductStock.available > 0 && selectedProductStock.available <= 10 && (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    )}
                    {selectedProductStock.available === 0 && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    <span className="font-semibold">{selectedProductStock.available} units</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">On Hand:</span>
                    <span>{selectedProductStock.onHand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reserved:</span>
                    <span>{selectedProductStock.reserved}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {priceQuote && selectedProductId && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4 space-y-3">
                <TooltipProvider>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      Suggested Price:
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[280px]">
                          <p className="text-sm">
                            The recommended selling price calculated by applying pricing rules to the product's cost
                            basis
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                    <span className="text-lg font-semibold">
                      {formatCurrency(Number.parseFloat(priceQuote.listPrice))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      Cost Basis:
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[280px]">
                          <p className="text-sm">
                            The actual cost per unit used to calculate the selling price, typically the landed cost from
                            inventory batches
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </span>
                    <span>{formatCurrency(Number.parseFloat(priceQuote.unitCost))}</span>
                  </div>

                  {priceQuote.costBasis && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        Margin Source:
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[280px]">
                            <p className="text-sm">
                              Where the cost came from - typically "product_batch_landed_cost" means calculated from
                              received inventory batches
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </span>
                      <span className="text-xs bg-secondary px-2 py-0.5 rounded font-mono">{priceQuote.costBasis}</span>
                    </div>
                  )}

                  {priceQuote.appliedMarginPercent && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        Margin:
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[280px]">
                            <p className="text-sm">
                              The profit percentage added to the cost basis from the active pricing rule
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </span>
                      <span className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        {priceQuote.appliedMarginPercent}%
                      </span>
                    </div>
                  )}
                </TooltipProvider>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={useSuggestedPrice}
                  className="w-full mt-2 bg-transparent"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Use Suggested Price
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              {...register("quantity", { required: "Quantity is required" })}
            />
            {selectedProductStock && Number.parseFloat(quantity || "0") > selectedProductStock.available && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Quantity exceeds available stock ({selectedProductStock.available} units)
              </p>
            )}
            {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountAmount">Discount Amount</Label>
              <Input
                id="discountAmount"
                type="number"
                step="0.01"
                {...register("discountAmount", {
                  onChange: () => setManualPriceEdit(false),
                })}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">Fixed discount in currency</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountPercent">Discount %</Label>
              <Input
                id="discountPercent"
                type="number"
                step="0.01"
                {...register("discountPercent", {
                  onChange: () => setManualPriceEdit(false),
                })}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">Percentage off list price</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitPrice">Unit Price</Label>
            <Input
              id="unitPrice"
              type="number"
              step="0.000001"
              placeholder="Auto-calculated from discount"
              {...register("unitPrice", {
                onChange: () => setManualPriceEdit(true),
              })}
              className="font-mono text-lg"
            />
            <p className="text-xs text-muted-foreground">
              {manualPriceEdit
                ? "Manual price set - discounts won't auto-apply"
                : "Calculated automatically from discount, or enter manually"}
            </p>
          </div>

          {taxConfig?.is_enabled && selectedProductId && unitPrice && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tax Configuration</span>
                  {applicableTaxRule && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {applicableTaxRule.name} ({applicableTaxRule.rate}%)
                    </span>
                  )}
                </div>

                {activeTaxRules.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="taxRule" className="text-xs">
                      Tax Rule (Optional Override)
                    </Label>
                    <Select
                      value={selectedTaxRuleId || "default"}
                      onValueChange={(value) => setSelectedTaxRuleId(value === "default" ? null : value)}
                    >
                      <SelectTrigger id="taxRule">
                        <SelectValue placeholder="Use default tax rule" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">
                          Use Default {taxConfig.default_tax_rule_id ? "(Configured)" : "(None)"}
                        </SelectItem>
                        {activeTaxRules.map((rule) => (
                          <SelectItem key={rule.id} value={rule.id}>
                            {rule.name} - {rule.rate}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-mono">{formatCurrency(calculatedAmounts.subtotal)}</span>
                  </div>
                  {applicableTaxRule && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Tax ({applicableTaxRule.name} {applicableTaxRule.rate}%):
                      </span>
                      <span className="font-mono">{formatCurrency(calculatedAmounts.taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between font-semibold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-lg font-mono">{formatCurrency(calculatedAmounts.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!taxConfig?.is_enabled && selectedProductId && (
            <p className="text-sm text-muted-foreground">
              Tax is not enabled. Configure tax settings in Finance → Tax Configuration.
            </p>
          )}

          <p className="text-sm text-muted-foreground">
            Note: If you don't specify a unit price, the system will automatically calculate it based on active pricing
            rules.
          </p>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addItemMutation.isPending || !selectedProductId}>
              {addItemMutation.isPending ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
