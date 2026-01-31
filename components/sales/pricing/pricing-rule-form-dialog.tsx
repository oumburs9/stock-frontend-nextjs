"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import type { AxiosError } from "axios"
import { useCreatePricingRule, useUpdatePricingRule } from "@/lib/hooks/use-sales"
import { useProducts } from "@/lib/hooks/use-products"
import { useCategories } from "@/lib/hooks/use-categories"
import { useBrands } from "@/lib/hooks/use-brands"
import type { PricingRule } from "@/lib/types/sales"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchableCombobox } from "@/components/shared/searchable-combobox"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"

interface PricingRuleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pricingRule: PricingRule | null
}

interface FormData {
  name: string
  description?: string
  targetType: "all" | "product" | "category" | "brand"
  targetProductId?: string
  targetCategoryId?: string
  targetBrandId?: string
  pricingType: "margin" | "fixed"
  marginPercent?: string
  fixedPrice?: string
  isActive: boolean
  validFrom?: string
  validTo?: string
}

export function PricingRuleFormDialog({ open, onOpenChange, pricingRule }: PricingRuleFormDialogProps) {
  const toast = useToast()
  const createRule = useCreatePricingRule()
  const updateRule = useUpdatePricingRule()
  const { data: products } = useProducts()
  const { data: categories } = useCategories()
  const { data: brands } = useBrands()
  const { hasPermission } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      targetType: "all",
      pricingType: "margin",
      marginPercent: "20",
      isActive: true,
    },
  })

  const targetType = watch("targetType")
  const pricingType = watch("pricingType")

  useEffect(() => {
    if (pricingRule) {
      reset({
        name: pricingRule.name,
        description: pricingRule.description || "",
        targetType: pricingRule.target_type,
        targetProductId: pricingRule.target_product_id || "",
        targetCategoryId: pricingRule.target_category_id || "",
        targetBrandId: pricingRule.target_brand_id || "",
        pricingType: pricingRule.margin_percent ? "margin" : "fixed",
        marginPercent: pricingRule.margin_percent || "",
        fixedPrice: pricingRule.fixed_price || "",
        isActive: pricingRule.is_active,
        validFrom: pricingRule.valid_from || "",
        validTo: pricingRule.valid_to || "",
      })
    }
  }, [pricingRule, reset])

  const onSubmit = async (data: FormData) => {
    if (pricingRule && !hasPermission("pricing-rule:update")) return
    if (!pricingRule && !hasPermission("pricing-rule:create")) return

    const payload: any = {
      name: data.name,
      description: data.description || undefined,
      targetType: data.targetType,
      isActive: data.isActive,
      validFrom: data.validFrom || undefined,
      validTo: data.validTo || undefined,
    }

    if (data.targetType === "product") payload.targetProductId = data.targetProductId
    if (data.targetType === "category") payload.targetCategoryId = data.targetCategoryId
    if (data.targetType === "brand") payload.targetBrandId = data.targetBrandId

    if (data.pricingType === "margin") {
      payload.marginPercent = data.marginPercent
    } else {
      payload.fixedPrice = data.fixedPrice
    }

    try {
      if (pricingRule) {
        await updateRule.mutateAsync({ id: pricingRule.id, data: payload })
        toast.success("Pricing rule updated successfully")
      } else {
        await createRule.mutateAsync(payload)
        toast.success("Pricing rule created successfully")
      }

      onOpenChange(false)
      reset()
    } catch (e) {
      const parsed = parseApiError(e as AxiosError)

      if (parsed.type === "validation") {
        Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof FormData, { message })
        })
        return
      }

      showApiErrorToast(parsed, toast, "Failed to save pricing rule")
    }
  }

  const isLoading = createRule.isPending || updateRule.isPending

  const productOptions =
    products?.map((product) => ({
      value: product.id,
      label: `${product.name} (${product.sku})`,
    })) || []

  const categoryOptions =
    categories?.map((category) => ({
      value: category.id,
      label: category.name,
    })) || []

  const brandOptions =
    brands?.map((brand) => ({
      value: brand.id,
      label: brand.name,
    })) || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{pricingRule ? "Edit Pricing Rule" : "Create Pricing Rule"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Rule Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Electronics 25% Margin"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                rows={2}
                placeholder="Describe when this rule should be applied..."
              />
            </div>
          </div>

          {/* Target Configuration Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium text-muted-foreground">Target Configuration</h3>

            <div className="space-y-2">
              <Label>Target Type *</Label>
              <Select value={targetType} onValueChange={(value: any) => setValue("targetType", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="product">Specific Product</SelectItem>
                  <SelectItem value="category">Product Category</SelectItem>
                  <SelectItem value="brand">Product Brand</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {targetType === "product" && (
              <div className="space-y-2">
                <Label>Select Product *</Label>
                <SearchableCombobox
                  value={watch("targetProductId") || ""}
                  onChange={(value) => setValue("targetProductId", value)}
                  options={productOptions}
                  placeholder="Select a product..."
                  searchPlaceholder="Search products..."
                  emptyMessage="No products found."
                />
                {errors.targetProductId && <p className="text-sm text-destructive">{errors.targetProductId.message}</p>}
              </div>
            )}

            {targetType === "category" && (
              <div className="space-y-2">
                <Label>Select Category *</Label>
                <SearchableCombobox
                  value={watch("targetCategoryId") || ""}
                  onChange={(value) => setValue("targetCategoryId", value)}
                  options={categoryOptions}
                  placeholder="Select a category..."
                  searchPlaceholder="Search categories..."
                  emptyMessage="No categories found."
                />
                {errors.targetCategoryId && (
                  <p className="text-sm text-destructive">{errors.targetCategoryId.message}</p>
                )}
              </div>
            )}

            {targetType === "brand" && (
              <div className="space-y-2">
                <Label>Select Brand *</Label>
                <SearchableCombobox
                  value={watch("targetBrandId") || ""}
                  onChange={(value) => setValue("targetBrandId", value)}
                  options={brandOptions}
                  placeholder="Select a brand..."
                  searchPlaceholder="Search brands..."
                  emptyMessage="No brands found."
                />
                {errors.targetBrandId && <p className="text-sm text-destructive">{errors.targetBrandId.message}</p>}
              </div>
            )}
          </div>

          {/* Pricing Strategy Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium text-muted-foreground">Pricing Strategy</h3>

            <div className="space-y-2">
              <Label>Pricing Type *</Label>
              <Select value={pricingType} onValueChange={(value: any) => setValue("pricingType", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="margin">Margin Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {pricingType === "margin" ? (
              <div className="space-y-2">
                <Label htmlFor="marginPercent">Margin Percentage *</Label>
                <div className="relative">
                  <Input
                    id="marginPercent"
                    type="number"
                    step="0.01"
                    {...register("marginPercent")}
                    placeholder="20"
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Markup percentage added to cost (e.g., 20 for 20% markup)
                </p>
                {errors.marginPercent && <p className="text-sm text-destructive">{errors.marginPercent.message}</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="fixedPrice">Fixed Price (ETB) *</Label>
                <Input
                  id="fixedPrice"
                  type="number"
                  step="0.01"
                  {...register("fixedPrice")}
                  placeholder="1000.00"
                />
                <p className="text-xs text-muted-foreground">Set a fixed selling price regardless of cost</p>
                {errors.fixedPrice && <p className="text-sm text-destructive">{errors.fixedPrice.message}</p>}
              </div>
            )}
          </div>

          {/* Validity Period Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium text-muted-foreground">Validity Period</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input id="validFrom" type="date" {...register("validFrom")} />
                <p className="text-xs text-muted-foreground">Start date (optional)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="validTo">Valid To</Label>
                <Input id="validTo" type="date" {...register("validTo")} />
                <p className="text-xs text-muted-foreground">End date (optional)</p>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-medium text-muted-foreground">Status</h3>

            <div className="space-y-2">
              <Select
                value={watch("isActive") ? "active" : "inactive"}
                onValueChange={(value) => setValue("isActive", value === "active")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active - Rule is currently applied</SelectItem>
                  <SelectItem value="inactive">Inactive - Rule is disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pricingRule ? "Update Rule" : "Create Rule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
