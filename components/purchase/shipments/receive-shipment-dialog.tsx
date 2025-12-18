"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { useReceiveShipment } from "@/lib/hooks/use-shipments"
import { useWarehouses } from "@/lib/hooks/use-warehouses"
import { useShops } from "@/lib/hooks/use-shops"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchableCombobox } from "@/components/shared/searchable-combobox"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2 } from "lucide-react"
import type { PurchaseShipment, ReceiveShipmentRequest } from "@/lib/types/purchase"
import { useProducts } from "@/lib/hooks/use-products"

interface ReceiveShipmentDialogProps {
  shipment: PurchaseShipment
  selectedItemId?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReceiveShipmentDialog({ shipment, selectedItemId, open, onOpenChange }: ReceiveShipmentDialogProps) {
  const { toast } = useToast()
  const receiveMutation = useReceiveShipment()
  const { data: warehouses = [] } = useWarehouses()
  const { data: shops = [] } = useShops()
  const [showPostings, setShowPostings] = useState(false)
  const [postings, setPostings] = useState<any>(null)
  const { data: products } = useProducts()

  const getProductName = (productrId: string) => {
    const supplier = products?.find((s) => s.id === productrId)
    return supplier?.name || productrId.slice(0, 8) + "..."
  }

  const canReceive = ["draft", "arrived", "cleared", "partially_received"].includes(shipment.status)

  const itemsToReceive = shipment.items.filter((item) => {
    const hasRemaining = Number.parseFloat(item.quantity_received) < Number.parseFloat(item.quantity_expected)
    if (selectedItemId) {
      return item.id === selectedItemId && hasRemaining
    }
    return hasRemaining
  })

  const { register, handleSubmit, control, watch, setValue } = useForm<ReceiveShipmentRequest>({
    defaultValues: {
      lines: itemsToReceive.map((item) => ({
        shipment_item_id: item.id,
        base_unit_cost: "0",
        allocations: [
          {
            location_type: "warehouse",
            location_id: "",
            quantity: String(Number.parseFloat(item.quantity_expected) - Number.parseFloat(item.quantity_received)),
          },
        ],
      })),
    },
  })

  const onSubmit = async (data: ReceiveShipmentRequest) => {
    if (!canReceive) {
      toast({
        title: "Cannot Receive",
        description: "Shipment can only be received in arrived, cleared, or partially_received status",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await receiveMutation.mutateAsync({ id: shipment.id, data })
      setPostings({
        ...result,
        postings: Array.isArray(result?.postings) ? result.postings : [],
      })
      setShowPostings(true)
      toast({
        title: "Success",
        description: "Shipment items received successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to receive shipment",
        variant: "destructive",
      })
    }
  }

  if (showPostings && postings) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Receiving Complete - Status: {postings.status.replace("_", " ")} | Expense per unit:{" "}
              {postings.expense_per_unit}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Before</TableHead>
                    <TableHead>After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(Array.isArray(postings?.postings) ? postings.postings : []).map((posting: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">{ getProductName(posting.product_id) }</TableCell>
                      <TableCell>{posting.allocation.quantity}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{posting.allocation.type}</div>
                          <div className="text-xs text-muted-foreground">{posting.allocation.id.slice(0, 8)}...</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{posting.batch_id.slice(0, 8)}...</TableCell>
                      <TableCell>{posting.stock_posting.beforeQuantity}</TableCell>
                      <TableCell className="font-medium">{posting.stock_posting.afterQuantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  if (!canReceive) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot Receive</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Shipment can only be received when status is arrived, cleared, or partially_received.
            <br />
            Current status: <span className="font-semibold">{shipment.status}</span>
          </p>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  if (itemsToReceive.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Items to Receive</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">All items in this shipment have been fully received.</p>
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
          <DialogTitle>Receive Shipment: {shipment.code}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            {itemsToReceive.map((item, lineIndex) => {
              const remaining = Number.parseFloat(item.quantity_expected) - Number.parseFloat(item.quantity_received)

              return (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      {/* <p className="font-medium">Product: {item.product_id.slice(0, 16)}...</p> */}
                       <p className="font-medium">Product: { getProductName(item.product_id) }</p>

                      <p className="text-sm text-muted-foreground">
                        Expected: {item.quantity_expected} | Received: {item.quantity_received} | Remaining:{" "}
                        {remaining.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Base Unit Cost</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="w-32"
                        {...register(`lines.${lineIndex}.base_unit_cost`, { required: true })}
                      />
                    </div>
                  </div>

                  <AllocationFields
                    lineIndex={lineIndex}
                    control={control}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    warehouses={warehouses}
                    shops={shops}
                  />
                </div>
              )
            })}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={receiveMutation.isPending}>
              {receiveMutation.isPending ? "Receiving..." : "Receive Items"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AllocationFields({ lineIndex, control, register, watch, setValue, warehouses, shops }: any) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `lines.${lineIndex}.allocations`,
  })

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Allocations</p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => append({ location_type: "warehouse", location_id: "", quantity: "0" })}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Location
        </Button>
      </div>

      {fields.map((field, allocIndex) => {
        const locationType = watch(`lines.${lineIndex}.allocations.${allocIndex}.location_type`) || "warehouse"
        const locationId = watch(`lines.${lineIndex}.allocations.${allocIndex}.location_id`) || ""

        const locationOptions =
          locationType === "warehouse"
            ? warehouses.map((w: any) => ({ value: w.id, label: w.name }))
            : shops.map((s: any) => ({ value: s.id, label: s.name }))

        return (
          <div key={field.id} className="flex gap-2 items-end p-2 bg-muted/50 rounded">
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <select
                {...register(`lines.${lineIndex}.allocations.${allocIndex}.location_type`, { required: true })}
                className="px-2 py-1.5 text-sm border border-input rounded-md bg-background h-9"
              >
                <option value="warehouse">Warehouse</option>
                <option value="shop">Shop</option>
              </select>
            </div>

            <div className="flex-1 space-y-1">
              <Label className="text-xs">Location</Label>
              <SearchableCombobox
                options={locationOptions}
                value={locationId}
                onChange={(value) => setValue(`lines.${lineIndex}.allocations.${allocIndex}.location_id`, value)}
                placeholder={`Select ${locationType}...`}
                emptyMessage={`No ${locationType} found`}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Quantity</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-24"
                {...register(`lines.${lineIndex}.allocations.${allocIndex}.quantity`, { required: true })}
              />
            </div>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => remove(allocIndex)}
              disabled={fields.length === 1}
              className="mb-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
