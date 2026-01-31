"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import type { AxiosError } from "axios"

import {
  useCreateExpenseType,
  useUpdateExpenseType,
} from "@/lib/hooks/use-expense-types"

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

import { useToast } from "@/hooks/use-toast"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"

import type {
  ExpenseType,
  CreateExpenseTypeRequest,
  UpdateExpenseTypeRequest,
} from "@/lib/types/purchase"
import { useAuth } from "@/lib/hooks/use-auth"

interface ExpenseTypeFormDialogProps {
  expenseType: ExpenseType | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExpenseTypeFormDialog({
  expenseType,
  open,
  onOpenChange,
}: ExpenseTypeFormDialogProps) {
  const toast = useToast()
  const createMutation = useCreateExpenseType()
  const updateMutation = useUpdateExpenseType()
  const { hasPermission } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateExpenseTypeRequest>({
    defaultValues: {
      code: "",
      name: "",
      scope: "shipment",
      capitalizable: false,
    },
  })

  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    setFormError(null)

    if (expenseType) {
      reset({
        code: expenseType.code,
        name: expenseType.name,
        scope: expenseType.scope,
        capitalizable: expenseType.capitalizable,
      })
    } else {
      reset({
        code: "",
        name: "",
        scope: "shipment",
        capitalizable: false,
      })
    }
  }, [expenseType, reset])

  const onSubmit = (data: CreateExpenseTypeRequest) => {
    setFormError(null)

    const action = expenseType
      ? updateMutation.mutateAsync({
          id: expenseType.id,
          data: {
            name: data.name,
            capitalizable: data.capitalizable,
          } satisfies UpdateExpenseTypeRequest,
        })
      : createMutation.mutateAsync(data)

    action
      .then(() => {
        toast.success(
          expenseType ? "Expense type updated" : "Expense type created",
        )
        onOpenChange(false)
        reset()
      })
      .catch((e: AxiosError) => {
        const parsed = parseApiError(e)

        if (parsed.type === "validation") {
          Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof CreateExpenseTypeRequest, { message })
          })
          if (parsed.formError) setFormError(parsed.formError)
          return
        }

        showApiErrorToast(parsed, toast)
      })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {expenseType ? "Edit Expense Type" : "Create Expense Type"}
          </DialogTitle>
        </DialogHeader>

        {formError && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code *</Label>
            <Input
              id="code"
              {...register("code")}
              disabled={!!expenseType}
              placeholder="e.g., freight, customs"
            />
            {errors.code?.message && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Freight Cost"
            />
            {errors.name?.message && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="scope">Scope *</Label>
            <select
              id="scope"
              {...register("scope")}
              disabled={!!expenseType}
              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="shipment">Shipment</option>
              <option value="batch">Batch</option>
            </select>
            {errors.scope?.message && (
              <p className="text-sm text-destructive">{errors.scope.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="capitalizable"
              {...register("capitalizable")}
              className="h-4 w-4"
            />
            <Label htmlFor="capitalizable" className="cursor-pointer">
              Capitalizable (adds to inventory cost)
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                Boolean(
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  (!expenseType &&
                    !hasPermission("purchase-expense-type:create")) ||
                  (expenseType &&
                    !hasPermission("purchase-expense-type:update"))
                  )
              }
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
