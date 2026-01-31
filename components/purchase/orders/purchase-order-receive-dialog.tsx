"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import type { AxiosError } from "axios"

import { useReceivePurchaseOrder } from "@/lib/hooks/use-purchase-orders"
import { useWarehouses } from "@/lib/hooks/use-warehouses"
import { useShops } from "@/lib/hooks/use-shops"
import { useProducts } from "@/lib/hooks/use-products"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SearchableCombobox } from "@/components/shared/searchable-combobox"

import { useToast } from "@/hooks/use-toast"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"

import type { PurchaseOrder, ReceivePurchaseOrderRequest } from "@/lib/types/purchase"
import { useAuth } from "@/lib/hooks/use-auth"

interface PurchaseOrderReceiveDialogProps {
  purchaseOrder: PurchaseOrder
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedItemId?: string | null
}

type FormValues = ReceivePurchaseOrderRequest & {
  selectedItems: boolean[]
}

export function PurchaseOrderReceiveDialog({
  purchaseOrder,
  open,
  onOpenChange,
  selectedItemId,
}: PurchaseOrderReceiveDialogProps) {
  const toast = useToast()
  const receiveMutation = useReceivePurchaseOrder()

  const { data: warehouses } = useWarehouses()
  const { data: shops } = useShops()
  const { data: products } = useProducts()
  const { hasPermission } = useAuth()

  const [showPostings, setShowPostings] = useState(false)
  const [postings, setPostings] = useState<any>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const getProductName = (productId: string) => {
    const product = products?.find((p) => p.id === productId)
    return product?.name || productId.slice(0, 8) + "..."
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      selectedItems: purchaseOrder.items.map((item) =>
        selectedItemId ? item.id === selectedItemId : true,
      ),
      lines: purchaseOrder.items.map((item) => ({
        purchase_order_item_id: item.id,
        quantity_received: item.quantity_remaining,
        location_type: "warehouse",
        location_id: "",
      })),
    },
  })

  const { fields } = useFieldArray({
    control,
    name: "lines",
  })

  const onSubmit = (data: FormValues) => {
    setFormError(null)

    const selectedLines = data.lines.filter((_, index) => data.selectedItems[index])

    receiveMutation
      .mutateAsync({
        id: purchaseOrder.id,
        data: { lines: selectedLines },
      })
      .then((result) => {
        setPostings(result)
        setShowPostings(true)
        toast.success("Purchase order received")
      })
      .catch((e: AxiosError) => {
        const parsed = parseApiError(e)

        if (parsed.type === "validation") {
          Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
            setError(field as any, { message })
          })
          if (parsed.formError) setFormError(parsed.formError)
          return
        }

        showApiErrorToast(parsed, toast, "Failed to receive purchase order.")
      })
  }

  const getLocationOptions = (index: number) => {
    const locationType = watch(`lines.${index}.location_type`)
    return locationType === "warehouse"
      ? warehouses?.map((w) => ({ value: w.id, label: w.name })) || []
      : shops?.map((s) => ({ value: s.id, label: s.name })) || []
  }

  if (showPostings && postings) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Receiving Complete - Stock Postings</DialogTitle>
          </DialogHeader>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Stock Before</TableHead>
                  <TableHead>Stock After</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {postings.postings.map((posting: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{getProductName(posting.product_id)}</TableCell>
                    <TableCell>{posting.received_quantity}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{posting.location.type}</div>
                        <div className="text-xs text-muted-foreground">
                          {posting.location.id.slice(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {posting.batch_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{posting.stock_posting.beforeQuantity}</TableCell>
                    <TableCell className="font-medium">
                      {posting.stock_posting.afterQuantity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Receive Purchase Order: {purchaseOrder.code}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {selectedItemId
              ? "Receiving selected product"
              : "Select which products to receive and specify quantities"}
          </p>
        </DialogHeader>

        {formError && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Ordered</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead>Receive Qty</TableHead>
                  <TableHead>Location Type</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrder.items.map((item, index) => {
                  const isSelected = watch(`selectedItems.${index}`)
                  return (
                    <TableRow key={item.id} className={!isSelected ? "opacity-50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            setValue(`selectedItems.${index}`, checked as boolean)
                          }
                        />
                      </TableCell>

                      <TableCell>{getProductName(item.product_id)}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        {item.quantity_remaining}
                      </TableCell>

                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          className="w-28"
                          disabled={!isSelected}
                          {...register(`lines.${index}.quantity_received`)}
                        />
                        {errors.lines?.[index]?.quantity_received?.message && (
                          <p className="text-sm text-destructive">
                            {errors.lines[index]?.quantity_received?.message}
                          </p>
                        )}
                      </TableCell>

                      <TableCell>
                        <select
                          disabled={!isSelected}
                          {...register(`lines.${index}.location_type`)}
                          onChange={(e) => {
                            setValue(
                              `lines.${index}.location_type`,
                              e.target.value as "warehouse" | "shop",
                            )
                            setValue(`lines.${index}.location_id`, "")
                          }}
                          className="px-2 py-1 text-sm border border-input rounded-md bg-background disabled:opacity-50"
                        >
                          <option value="warehouse">Warehouse</option>
                          <option value="shop">Shop</option>
                        </select>
                      </TableCell>

                      <TableCell>
                        <div className="w-48">
                          <SearchableCombobox
                            value={watch(`lines.${index}.location_id`)}
                            onChange={(value) =>
                              setValue(`lines.${index}.location_id`, value)
                            }
                            options={getLocationOptions(index)}
                            placeholder="Select location..."
                            searchPlaceholder="Search..."
                            emptyMessage="No locations found."
                            disabled={!isSelected}
                          />
                        </div>
                        {errors.lines?.[index]?.location_id?.message && (
                          <p className="text-sm text-destructive">
                            {errors.lines[index]?.location_id?.message}
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={receiveMutation.isPending || !hasPermission("purchase-order:receive")}
            >
              {receiveMutation.isPending ? "Receiving..." : "Receive Selected Items"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
