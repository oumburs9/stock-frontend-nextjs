"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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

const formSchema = z.object({
  commission_rule_id: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

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
  const { toast } = useToast()
  const updateAgentSale = useUpdateAgentSale()
  const { data: commissionRules = [] } = useCommissionRules()
  const { data: products = [] } = useProducts()
  const { hasPermission } = useAuth()

  const [items, setItems] = useState<ItemRow[]>([])
  const [activeTab, setActiveTab] = useState("info")

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commission_rule_id: agentSale.commission_rule_id || "",
      notes: agentSale.notes || "",
    },
  })

  const commissionRuleId = watch("commission_rule_id")
  const notes = watch("notes")

  useEffect(() => {
    if (open) {
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
    }
  }, [open, agentSale, reset])

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

  const onSubmit = (data: FormData) => {
    if (!hasPermission("agent-sale:update")) return
    const validItems = items.filter((item) => item.productId && item.quantity && item.grossUnitPrice)

    // Validation
    if (activeTab === "items" && validItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Agent sale must have at least one item with all required fields filled.",
        variant: "destructive",
      })
      return
    }

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
          toast({
            title: "Success",
            description: "Agent sale updated successfully.",
          })
          onOpenChange(false)
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || "Failed to update agent sale."
          toast({
            title: "Error Updating Agent Sale",
            description: errorMessage,
            variant: "destructive",
          })
        },
      },
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Agent Sale - {agentSale.code}</DialogTitle>
          </DialogHeader>

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              This agent sale is in <strong>DRAFT</strong> status. You can edit all information until it's confirmed.
            </AlertDescription>
          </Alert>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="info">Sale Information</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Sale Information Tab */}
              <TabsContent value="info" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Sale Code</Label>
                  <Input id="code" value={agentSale.code} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commission_rule_id">Commission Rule</Label>
                  <Select
                    value={commissionRuleId}
                    onValueChange={(value) => register("commission_rule_id").onChange({ target: { value } })}
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
                  <Textarea id="notes" {...register("notes")} rows={4} placeholder="Add notes about this sale..." />
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

              {/* Items Tab */}
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

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
