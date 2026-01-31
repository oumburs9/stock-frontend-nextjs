"use client"

import { useForm } from "react-hook-form"
import type { AxiosError } from "axios"

import { useAddBatchExpenseAdjustment } from "@/lib/hooks/use-batches"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { InfoIcon } from "lucide-react"

import { useToast } from "@/hooks/use-toast"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"

import type { BatchExpense } from "@/lib/types/purchase"
import { useAuth } from "@/lib/hooks/use-auth"

interface AdjustBatchExpenseDialogProps {
  expense: BatchExpense
  hasRemainingQuantity: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormValues {
  amount: string
  reason: string
}

export function AdjustBatchExpenseDialog({
  expense,
  hasRemainingQuantity,
  open,
  onOpenChange,
}: AdjustBatchExpenseDialogProps) {
  const toast = useToast()
  const { hasPermission } = useAuth()
  const adjustMutation = useAddBatchExpenseAdjustment()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      amount: "",
      reason: "",
    },
  })

  const onSubmit = (data: FormValues) => {
    adjustMutation
      .mutateAsync({
        expenseId: expense.id,
        data,
      })
      .then(() => {
        onOpenChange(false)
        reset()
        toast.success("Expense adjusted successfully")
      })
      .catch((e: AxiosError) => {
        const parsed = parseApiError(e)

        if (parsed.type === "validation") {
          Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof FormValues, { message })
          })
          return
        }

        showApiErrorToast(parsed, toast, "Failed to adjust batch expense.")
      })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adjust Batch Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Adjustment applies only to remaining inventory. Previously sold units are not affected.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Current Expense</Label>
            <div className="p-3 border rounded-md bg-muted/50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">{expense.type}</span>
                <span className="text-sm font-mono">
                  ETB {Number.parseFloat(expense.amount).toFixed(2)}
                </span>
              </div>
              {expense.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {expense.description}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">
              Adjustment Amount *
              <span className="text-xs text-muted-foreground ml-2">
                (use negative for reductions)
              </span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="e.g., -25 or 10"
              {...register("amount")}
              disabled={!hasRemainingQuantity}
            />
            {errors.amount?.message && (
              <p className="text-sm text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Explain why this adjustment is needed..."
              rows={3}
              {...register("reason")}
              disabled={!hasRemainingQuantity}
            />
            {errors.reason?.message && (
              <p className="text-sm text-destructive">
                {errors.reason.message}
              </p>
            )}
          </div>

          {!hasRemainingQuantity && (
            <p className="text-sm text-destructive">
              Batch fully consumed. Adjustment not allowed.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                adjustMutation.isPending ||
                !hasRemainingQuantity ||
                !hasPermission("product-batch-expense:adjust")
              }
            >
              {adjustMutation.isPending ? "Adjusting..." : "Add Adjustment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
