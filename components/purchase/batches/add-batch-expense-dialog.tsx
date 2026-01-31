"use client"

import { useForm } from "react-hook-form"
import type { AxiosError } from "axios"
import { useMemo } from "react"

import { useAddBatchExpense } from "@/lib/hooks/use-batches"
import { useExpenseTypes } from "@/lib/hooks/use-expense-types"

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
import { SearchableCombobox } from "@/components/shared/searchable-combobox"

import { useToast } from "@/hooks/use-toast"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"

import type { AddBatchExpenseRequest } from "@/lib/types/purchase"
import { useAuth } from "@/lib/hooks/use-auth"

interface AddBatchExpenseDialogProps {
  batchId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddBatchExpenseDialog({
  batchId,
  open,
  onOpenChange,
}: AddBatchExpenseDialogProps) {
  const toast = useToast()
  const addExpenseMutation = useAddBatchExpense()
  const { hasPermission } = useAuth()

  const { data: expenseTypes } = useExpenseTypes({ scope: "batch" })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<AddBatchExpenseRequest>({
    defaultValues: {
      type: "",
      amount: "",
      description: "",
    },
  })

  const selectedExpenseType = watch("type")

  const expenseTypeOptions = useMemo(
    () =>
      expenseTypes?.map((et) => ({
        value: et.code,
        label: `${et.name} (${et.code})`,
      })) || [],
    [expenseTypes],
  )

  const onSubmit = (data: AddBatchExpenseRequest) => {
    addExpenseMutation
      .mutateAsync({ id: batchId, data })
      .then(() => {
        onOpenChange(false)
        reset()
        toast.success("Batch expense added successfully.")
      })
      .catch((e: AxiosError) => {
        const parsed = parseApiError(e)

        if (parsed.type === "validation") {
          Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof AddBatchExpenseRequest, { message })
          })
          return
        }

        showApiErrorToast(parsed, toast, "Failed to add batch expense.")
      })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Batch Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Expense Type *</Label>
            <SearchableCombobox
              options={expenseTypeOptions}
              value={selectedExpenseType}
              onChange={(value) => setValue("type", value)}
              placeholder="Select expense type"
              searchPlaceholder="Search expense types..."
              emptyMessage="No expense types found"
            />
            {errors.type?.message && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("amount")}
            />
            {errors.amount?.message && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Optional notes"
              {...register("description")}
            />
            {errors.description?.message && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              This expense will be capitalized to the batch, increasing the landed
              unit cost for this specific batch.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                addExpenseMutation.isPending ||
                !hasPermission("product-batch-expense:add")
              }
            >
              {addExpenseMutation.isPending ? "Adding..." : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
