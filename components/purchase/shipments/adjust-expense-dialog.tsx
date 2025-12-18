"use client"

import { useForm } from "react-hook-form"
import { useAddShipmentExpenseAdjustment } from "@/lib/hooks/use-shipments"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { ShipmentExpense } from "@/lib/types/purchase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface AdjustShipmentExpenseDialogProps {
  expense: ShipmentExpense
  shipmentStatus: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdjustShipmentExpenseDialog({
  expense,
  shipmentStatus,
  open,
  onOpenChange,
}: AdjustShipmentExpenseDialogProps) {
  const { toast } = useToast()
  const adjustMutation = useAddShipmentExpenseAdjustment()

  const canAdjust = !["received", "closed"].includes(shipmentStatus)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{
    amount: string
    reason: string
  }>({
    defaultValues: {
      amount: "",
      reason: "",
    },
  })

  const onSubmit = async (data: { amount: string; reason: string }) => {
    if (!canAdjust) {
      toast({
        title: "Cannot Adjust",
        description: "Adjustments not allowed for received/closed shipments",
        variant: "destructive",
      })
      return
    }

    if (Number.parseFloat(data.amount) === 0) {
      toast({
        title: "Invalid Amount",
        description: "Adjustment amount cannot be zero",
        variant: "destructive",
      })
      return
    }

    try {
      await adjustMutation.mutateAsync({ expenseId: expense.id, data })
      onOpenChange(false)
      reset()
    } catch (error: any) {
      // Error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adjust Shipment Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription className="text-sm">
              This adjustment affects only future receiving. Already received quantities will not change.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Current Expense</Label>
            <div className="p-3 border rounded-md bg-muted/50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">{expense.type}</span>
                <span className="text-sm font-mono">${Number.parseFloat(expense.amount).toFixed(2)}</span>
              </div>
              {expense.description && <p className="text-sm text-muted-foreground mt-1">{expense.description}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Adjustment Amount *
              <span className="text-xs text-muted-foreground ml-2">(use negative for reductions)</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="e.g., -50 or 20"
              {...register("amount", { required: "Amount is required" })}
              disabled={!canAdjust}
            />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Explain why this adjustment is needed..."
              rows={3}
              {...register("reason")}
              disabled={!canAdjust}
            />
          </div>

          {!canAdjust && (
            <p className="text-sm text-destructive">
              Adjustments can only be made for shipments in draft, in_transit, arrived, cleared, or partially_received
              status
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={adjustMutation.isPending || !canAdjust}>
              {adjustMutation.isPending ? "Adjusting..." : "Add Adjustment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
