"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCreateAgentSale, useCommissionRules } from "@/lib/hooks/use-agent-sales"
import { usePartners } from "@/lib/hooks/use-partners"
import { useProducts } from "@/lib/hooks/use-products"
import { SearchableCombobox } from "@/components/shared/searchable-combobox"
import { useAuth } from "@/lib/hooks/use-auth"
import type { AxiosError } from "axios"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"

type FormData = {
  code: string
  customerId: string
  principalId: string
  saleDate: string
  currency: string
  commissionType: "license_use" | "principal_commission"
  commissionRuleId: string
  notes?: string
}

interface AgentSaleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ItemRow {
  productId: string
  quantity: string
  grossUnitPrice: string
}

export function AgentSaleFormDialog({ open, onOpenChange }: AgentSaleFormDialogProps) {
  const router = useRouter()
  const toast = useToast()
  const createMutation = useCreateAgentSale()

  const { data: commissionRules = [] } = useCommissionRules()
  const { data: customers = [] } = usePartners("customer")
  const { data: suppliers = [] } = usePartners("supplier")
  const { data: products = [] } = useProducts()
  const { hasPermission } = useAuth()

  const [items, setItems] = useState<ItemRow[]>([{ productId: "", quantity: "1", grossUnitPrice: "0" }])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm<FormData>({
    defaultValues: {
      code: `AG-${Date.now()}`,
      customerId: "",
      principalId: "",
      saleDate: new Date().toISOString().split("T")[0],
      currency: "ETB",
      commissionType: "license_use",
      commissionRuleId: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (!open) {
      reset({
        code: `AG-${Date.now()}`,
        customerId: "",
        principalId: "",
        saleDate: new Date().toISOString().split("T")[0],
        currency: "ETB",
        commissionType: "license_use",
        commissionRuleId: "",
        notes: "",
      })
      setItems([{ productId: "", quantity: "1", grossUnitPrice: "0" }])
      clearErrors()
    }
  }, [open, reset, clearErrors])

  const commissionType = watch("commissionType")
  const currency = watch("currency")
  const commissionRuleId = watch("commissionRuleId")

  const selectedRule = commissionRules.find((rule) => rule.id === commissionRuleId)

  const customerOptions = customers.map((c) => ({ value: c.id, label: c.name }))
  const principalOptions = suppliers.map((s) => ({ value: s.id, label: s.name }))
  const productOptions = products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))
  const commissionRuleOptions = commissionRules
    .filter((rule) => rule.is_active && rule.commission_type === commissionType)
    .map((rule) => ({
      value: rule.id,
      label: `${rule.name} (${rule.value}% - ${rule.commission_type})`,
    }))

  const addItem = () => {
    setItems([...items, { productId: "", quantity: "1", grossUnitPrice: "0" }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: keyof ItemRow, value: string) => {
    const newItems = [...items]
    newItems[index][field] = value
    setItems(newItems)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const qty = Number.parseFloat(item.quantity) || 0
      const price = Number.parseFloat(item.grossUnitPrice) || 0
      return sum + qty * price
    }, 0)
  }

  const calculateCommission = () => {
    if (!selectedRule) return 0
    const grossTotal = calculateTotal()
    const commissionPercent = Number.parseFloat(selectedRule.value) || 0
    return (grossTotal * commissionPercent) / 100
  }

  const grossTotal = calculateTotal()
  const commissionAmount = calculateCommission()
  const netPrincipalTotal = grossTotal - commissionAmount

  const onSubmit = (data: FormData) => {
    if (!hasPermission("agent-sale:create")) return

    const validItems = items.filter((item) => item.productId && item.quantity && item.grossUnitPrice)

    if (validItems.length === 0) {
      setError("code", { message: "Please add at least one item" })
      return
    }

    createMutation.mutate(
      {
        ...data,
        items: validItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          grossUnitPrice: item.grossUnitPrice,
        })),
      },
      {
        onSuccess: (result) => {
          toast.success("Agent sale created", `Agent sale ${result.code} has been created successfully.`)
          onOpenChange(false)
          router.push(`/agent-sales/${result.id}`)
        },
        onError: (e: AxiosError) => {
          const parsed = parseApiError(e)

          if (parsed.type === "validation") {
            Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
              setError(field as keyof FormData, { message })
            })
            return
          }

          showApiErrorToast(parsed, toast, "Failed to create agent sale")
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Agent Sale</DialogTitle>
          <DialogDescription>Create a new agent sale transaction</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Sale Code</Label>
              <Input id="code" {...register("code")} onChange={(e) => { setValue("code", e.target.value); clearErrors("code") }} />
              {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="saleDate">Sale Date</Label>
              <Input id="saleDate" type="date" {...register("saleDate")} onChange={(e) => { setValue("saleDate", e.target.value); clearErrors("saleDate") }} />
              {errors.saleDate && <p className="text-sm text-destructive">{errors.saleDate.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer</Label>
              <SearchableCombobox
                value={watch("customerId")}
                onChange={(value) => {
                  setValue("customerId", value)
                  clearErrors("customerId")
                }}
                options={customerOptions}
                placeholder="Select customer..."
              />
              {errors.customerId && <p className="text-sm text-destructive">{errors.customerId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="principalId">Principal</Label>
              <SearchableCombobox
                value={watch("principalId")}
                onChange={(value) => {
                  setValue("principalId", value)
                  clearErrors("principalId")
                }}
                options={principalOptions}
                placeholder="Select principal..."
              />
              {errors.principalId && <p className="text-sm text-destructive">{errors.principalId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" {...register("currency")} onChange={(e) => { setValue("currency", e.target.value); clearErrors("currency") }} />
              {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="commissionType">Commission Type</Label>
              <Select
                value={commissionType}
                onValueChange={(value) => {
                  setValue("commissionType", value as any)
                  setValue("commissionRuleId", "")
                  clearErrors("commissionType")
                  clearErrors("commissionRuleId")
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="license_use">License Use</SelectItem>
                  <SelectItem value="principal_commission">Principal Commission</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commissionRuleId">Commission Rule</Label>
              <Select
                value={commissionRuleId}
                onValueChange={(value) => {
                  setValue("commissionRuleId", value)
                  clearErrors("commissionRuleId")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select commission rule..." />
                </SelectTrigger>
                <SelectContent>
                  {commissionRuleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.commissionRuleId && <p className="text-sm text-destructive">{errors.commissionRuleId.message}</p>}
              {selectedRule && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedRule.value}% • Valid{" "}
                  {selectedRule.valid_from ? `from ${selectedRule.valid_from}` : "indefinitely"}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} rows={2} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Items</Label>
              {hasPermission("agent-sale:update") && (
                <Button type="button" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>)}
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="w-32">Quantity</TableHead>
                    <TableHead className="w-40">Unit Price</TableHead>
                    <TableHead className="w-40 text-right">Line Total</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => {
                    const lineTotal =
                      (Number.parseFloat(item.quantity) || 0) * (Number.parseFloat(item.grossUnitPrice) || 0)
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <SearchableCombobox
                            value={item.productId}
                            onChange={(value) => updateItem(index, "productId", value)}
                            options={productOptions}
                            placeholder="Select product..."
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", e.target.value)}
                            min="0"
                            step="1"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.grossUnitPrice}
                            onChange={(e) => updateItem(index, "grossUnitPrice", e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {lineTotal.toFixed(2)} {currency}
                        </TableCell>
                        <TableCell>
                          {hasPermission("agent-sale:update") && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              disabled={items.length === 1}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-semibold">
                      Gross Total:
                    </TableCell>
                    <TableCell className="text-right font-semibold font-mono">
                      {grossTotal.toFixed(2)} {currency}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {selectedRule && (
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Commission ({selectedRule.value}%):</span>
                  <span className="font-semibold">
                    {commissionAmount.toFixed(2)} {currency}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="font-semibold">Net Principal Total:</span>
                  <span className="font-bold">
                    {netPrincipalTotal.toFixed(2)} {currency}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              Create Agent Sale
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
