"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import type { AxiosError } from "axios"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUpdateAgentSale } from "@/lib/hooks/use-agent-sales"
import type { AgentSale } from "@/lib/types/agent-sales"
import { useToast } from "@/hooks/use-toast"
import { useCommissionRules } from "@/lib/hooks/use-agent-sales"
import { useProducts } from "@/lib/hooks/use-products"
import { SearchableCombobox } from "@/components/shared/searchable-combobox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, AlertCircle, Info } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"

interface FormData {
  commission_rule_id?: string
  notes?: string
}

interface ItemRow {
  productId: string
  quantity: string
  grossUnitPrice: string
}

interface EditAgentSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agentSale: AgentSale
}

export function EditAgentSaleDialog({ open, onOpenChange, agentSale }: EditAgentSaleDialogProps) {
  const toast = useToast()
  const updateAgentSale = useUpdateAgentSale()
  const { data: commissionRules = [] } = useCommissionRules()
  const { data: products = [] } = useProducts()
  const { hasPermission } = useAuth()

  const [items, setItems] = useState<ItemRow[]>([])
  const [activeTab, setActiveTab] = useState("info")
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      commission_rule_id: agentSale.commission_rule_id || "",
      notes: agentSale.notes || "",
    },
  })

  const commissionRuleId = watch("commission_rule_id")

  useEffect(() => {
    if (open) {
      setFormError(null)
      reset({
        commission_rule_id: agentSale.commission_rule_id || "",
        notes: agentSale.notes || "",
      })
      setItems(
        agentSale.items?.map((item) => ({
          productId: item.product_id,
          quantity: item.quantity,
          grossUnitPrice: item.gross_unit_price,
        })) || [{ productId: "", quantity: "1", grossUnitPrice: "0" }],
      )
      setActiveTab("info")
      clearErrors()
    }
  }, [open, agentSale, reset, clearErrors])

  const selectedRule = commissionRules.find((rule) => rule.id === commissionRuleId)
  const productOptions = products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))

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

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      setFormError(null)
      reset({
        commission_rule_id: agentSale.commission_rule_id || "",
        notes: agentSale.notes || "",
      })
      setItems([{ productId: "", quantity: "1", grossUnitPrice: "0" }])
      setActiveTab("info")
      clearErrors()
    }
  }

  const onSubmit = (data: FormData) => {
    if (!hasPermission("agent-sale:update")) return

    setFormError(null)

    const validItems = items.filter((item) => item.productId && item.quantity && item.grossUnitPrice)

    const updateData: any = {}

    if (data.commission_rule_id !== agentSale.commission_rule_id) {
      updateData.commission_rule_id = data.commission_rule_id
    }

    if (data.notes !== agentSale.notes) {
      updateData.notes = data.notes
    }

    if (activeTab === "items" && validItems.length > 0) {
      updateData.items = validItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        grossUnitPrice: item.grossUnitPrice,
      }))
    }

    updateAgentSale.mutate(
      {
        id: agentSale.id,
        data: updateData,
      },
      {
        onSuccess: () => {
          toast.success("Agent sale updated", "The agent sale was updated successfully.")
          handleOpenChange(false)
        },
        onError: (e: AxiosError) => {
          const parsed = parseApiError(e)

          if (parsed.type === "validation") {
            Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
              setError(field as keyof FormData, { message })
            })
            if (parsed.formError) setFormError(parsed.formError)
            return
          }

          showApiErrorToast(parsed, toast, "Failed to update agent sale.")
        },
      },
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Agent Sale - {agentSale.code}</DialogTitle>
          </DialogHeader>

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              This agent sale is in <strong>DRAFT</strong> status. You can edit all information until it's confirmed.
            </AlertDescription>
          </Alert>

          {formError && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {formError}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="info">Sale Information</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <TabsContent value="info" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Sale Code</Label>
                  <Input id="code" value={agentSale.code} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commission_rule_id">Commission Rule</Label>
                  <Select
                    value={commissionRuleId}
                    onValueChange={(value) => {
                      setValue("commission_rule_id", value, { shouldDirty: true })
                      clearErrors("commission_rule_id")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a commission rule" />
                    </SelectTrigger>
                    <SelectContent>
                      {commissionRules
                        .filter((rule) => rule.is_active)
                        .map((rule) => (
                          <SelectItem key={rule.id} value={rule.id}>
                            {rule.name} ({rule.value}% - {rule.commission_type})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {!commissionRules.some((r) => r.id === commissionRuleId && r.is_active) && commissionRuleId && (
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        The selected commission rule is inactive. Please select an active rule.
                      </AlertDescription>
                    </Alert>
                  )}
                  {selectedRule && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Valid from {selectedRule.valid_from || "N/A"} to {selectedRule.valid_to || "N/A"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    {...register("notes", {
                      onChange: (e) => {
                        register("notes").onChange(e)
                        clearErrors("notes")
                      },
                    })}
                    rows={4}
                    placeholder="Add notes about this sale..."
                  />
                  {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
                </div>

                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Sale Summary (Read-only)</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Gross Total:</span>
                    <span className="font-medium">
                      {agentSale.currency} {Number.parseFloat(agentSale.gross_total).toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">Commission:</span>
                    <span className="font-medium text-orange-600">
                      {agentSale.currency} {Number.parseFloat(agentSale.commission_total).toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">Net Principal:</span>
                    <span className="font-medium text-green-600">
                      {agentSale.currency} {Number.parseFloat(agentSale.net_principal_total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="items" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Sale Items</Label>
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
                              {lineTotal.toFixed(2)} {agentSale.currency}
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
                          {calculateTotal().toFixed(2)} {agentSale.currency}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateAgentSale.isPending}>
                  {updateAgentSale.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}
