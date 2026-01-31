"use client"

import { useForm } from "react-hook-form"
import { useUpdateShipment } from "@/lib/hooks/use-shipments"
import { useWarehouses } from "@/lib/hooks/use-warehouses"
import { useShops } from "@/lib/hooks/use-shops"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SearchableCombobox } from "@/components/shared/searchable-combobox"
import { useToast } from "@/hooks/use-toast"
import type { PurchaseShipment, UpdateShipmentRequest } from "@/lib/types/purchase"
import { useEffect, useState } from "react"
import type { AxiosError } from "axios"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"

interface UpdateShipmentDialogProps {
  shipment: PurchaseShipment
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateShipmentDialog({ shipment, open, onOpenChange }: UpdateShipmentDialogProps) {
  const toast = useToast()
  const updateMutation = useUpdateShipment()
  const { data: warehouses = [] } = useWarehouses()
  const { data: shops = [] } = useShops()

  const [locationType, setLocationType] = useState<"warehouse" | "shop">(
    shipment.receiving_warehouse_id ? "warehouse" : "shop",
  )

  const canEdit = ["draft", "in_transit", "arrived", "cleared"].includes(shipment.status)

  const { register, handleSubmit, reset, setValue, watch } = useForm<UpdateShipmentRequest>({
    defaultValues: {
      arrival_date: shipment.arrival_date || undefined,
      departure_date: shipment.departure_date || undefined,
      receiving_warehouse_id: shipment.receiving_warehouse_id || undefined,
      receiving_shop_id: shipment.receiving_shop_id || undefined,
      exchange_rate: shipment.exchange_rate || undefined,
      notes: shipment.notes || undefined,
    },
  })

  useEffect(() => {
    reset({
      arrival_date: shipment.arrival_date || undefined,
      departure_date: shipment.departure_date || undefined,
      receiving_warehouse_id: shipment.receiving_warehouse_id || undefined,
      receiving_shop_id: shipment.receiving_shop_id || undefined,
      exchange_rate: shipment.exchange_rate || undefined,
      notes: shipment.notes || undefined,
    })
    setLocationType(shipment.receiving_warehouse_id ? "warehouse" : "shop")
  }, [shipment, reset])

  const onSubmit = async (data: UpdateShipmentRequest) => {
    if (!canEdit) {
      toast.error(
        "Cannot Edit",
        "Shipment header can only be edited in draft, in_transit, arrived, or cleared status",
      )
      return
    }

    try {
      await updateMutation.mutateAsync({ id: shipment.id, data })
      toast.success("Shipment updated", "Shipment updated successfully")
      onOpenChange(false)
    } catch (e) {
      showApiErrorToast(parseApiError(e as AxiosError), toast, "Failed to update shipment")
    }
  }

  const handleLocationTypeChange = (type: "warehouse" | "shop") => {
    setLocationType(type)
    if (type === "warehouse") {
      setValue("receiving_shop_id", undefined)
    } else {
      setValue("receiving_warehouse_id", undefined)
    }
  }

  const selectedWarehouseId = watch("receiving_warehouse_id")
  const selectedShopId = watch("receiving_shop_id")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Shipment Details</DialogTitle>
          {!canEdit && (
            <p className="text-sm text-destructive">
              Shipment can only be edited in draft, in_transit, arrived, or cleared status
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departure_date">Departure Date</Label>
              <Input
                id="departure_date"
                type="date"
                {...register("departure_date")}
                disabled={!canEdit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="arrival_date">Arrival Date</Label>
              <Input
                id="arrival_date"
                type="date"
                {...register("arrival_date")}
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Receiving Location Type</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={locationType === "warehouse"}
                  onChange={() => handleLocationTypeChange("warehouse")}
                  disabled={!canEdit}
                  className="h-4 w-4"
                />
                <span className="text-sm">Warehouse</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={locationType === "shop"}
                  onChange={() => handleLocationTypeChange("shop")}
                  disabled={!canEdit}
                  className="h-4 w-4"
                />
                <span className="text-sm">Shop</span>
              </label>
            </div>
          </div>

          {locationType === "warehouse" ? (
            <div className="space-y-2">
              <Label>Receiving Warehouse</Label>
              <SearchableCombobox
                options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                value={selectedWarehouseId || ""}
                onValueChange={(value) => setValue("receiving_warehouse_id", value)}
                placeholder="Select warehouse..."
                emptyText="No warehouse found"
                disabled={!canEdit}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Receiving Shop</Label>
              <SearchableCombobox
                options={shops.map((s) => ({ value: s.id, label: s.name }))}
                value={selectedShopId || ""}
                onValueChange={(value) => setValue("receiving_shop_id", value)}
                placeholder="Select shop..."
                emptyText="No shop found"
                disabled={!canEdit}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="exchange_rate">Exchange Rate</Label>
            <Input
              id="exchange_rate"
              type="number"
              step="0.0001"
              placeholder="e.g., 135.50"
              {...register("exchange_rate")}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the shipment..."
              rows={3}
              {...register("notes")}
              disabled={!canEdit}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending || !canEdit}>
              {updateMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
