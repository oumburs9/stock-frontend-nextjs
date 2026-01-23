"use client"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useProducts } from "@/lib/hooks/use-products"
import { useUpdateAgentSale } from "@/lib/hooks/use-agent-sales"
import { SearchableCombobox } from "@/components/shared/searchable-combobox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Plus, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { AgentSale } from "@/lib/types/agent-sales"
import { useAuth } from "@/lib/hooks/use-auth"

const itemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.string().min(1, "Quantity is required"),
  grossUnitPrice: z.string().min(1, "Unit price is required"),
})

const formSchema = z.object({
  items: z.array(itemSchema).min(1, "At least one item is required"),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface EditAgentSaleItemsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agentSale: AgentSale
}

export function EditAgentSaleItemsDialog({ open, onOpenChange, agentSale }: EditAgentSaleItemsDialogProps) {
  const { toast } = useToast()
  const { data: products = [] } = useProducts()
  const updateMutation = useUpdateAgentSale()
  const { hasPermission } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      items: agentSale.items?.map((item) => ({
        productId: item.product_id,
        quantity: item.quantity,
        grossUnitPrice: item.gross_unit_price,
      })) || [{ productId: "", quantity: "", grossUnitPrice: "" }],
      notes: agentSale.notes || "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const items = watch("items")

  const productOptions =
    products?.map((product) => ({
      value: product.id,
      label: `${product.name} (${product.sku})`,
    })) || []

  const getProductPrice = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    return product?.price || "0"
  }

  const calculateLineTotal = (quantity: string, unitPrice: string) => {
    const qty = Number.parseFloat(quantity) || 0
    const price = Number.parseFloat(unitPrice) || 0
    return (qty * price).toFixed(2)
  }

  const onSubmit = async (data: FormData) => {
    if (!hasPermission("agent-sale:update")) return
    try {
      await updateMutation.mutateAsync({
        id: agentSale.id,
        data: {
          items: data.items,
          notes: data.notes || null,
        },
      })
      toast({
        title: "Items updated",
        description: "Agent sale items have been updated successfully.",
      })
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update items",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Sale Items</DialogTitle>
          <DialogDescription>Update the items for this agent sale</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Items</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => append({ productId: "", quantity: "", grossUnitPrice: "" })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[35%]">Product</TableHead>
                    <TableHead className="w-[15%]">Quantity</TableHead>
                    <TableHead className="w-[20%]">Unit Price</TableHead>
                    <TableHead className="w-[20%]">Line Total</TableHead>
                    <TableHead className="w-[10%] text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const item = items[index]
                    const lineTotal = item ? calculateLineTotal(item.quantity, item.grossUnitPrice) : "0.00"

                    return (
                      <TableRow key={field.id}>
                        <TableCell>
                          <SearchableCombobox
                            value={item?.productId || ""}
                            onChange={(value) => {
                              setValue(`items.${index}.productId`, value)
                              // Auto-fill price from product
                              const price = getProductPrice(value)
                              setValue(`items.${index}.grossUnitPrice`, price)
                            }}
                            options={productOptions}
                            placeholder="Select product..."
                          />
                          {errors.items?.[index]?.productId && (
                            <p className="text-xs text-destructive mt-1">{errors.items[index]?.productId?.message}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input type="number" step="0.01" placeholder="Qty" {...register(`items.${index}.quantity`)} />
                          {errors.items?.[index]?.quantity && (
                            <p className="text-xs text-destructive mt-1">{errors.items[index]?.quantity?.message}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Price"
                            {...register(`items.${index}.grossUnitPrice`)}
                          />
                          {errors.items?.[index]?.grossUnitPrice && (
                            <p className="text-xs text-destructive mt-1">
                              {errors.items[index]?.grossUnitPrice?.message}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {lineTotal} {agentSale.currency}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={fields.length === 1}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => remove(index)}
                                disabled={fields.length === 1}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input id="notes" {...register("notes")} placeholder="Add any notes..." />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              Update Items
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
