"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useCreateExpenseType, useUpdateExpenseType } from "@/lib/hooks/use-expense-types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import type { ExpenseType, CreateExpenseTypeRequest, UpdateExpenseTypeRequest } from "@/lib/types/purchase"
import { useAuth } from "@/lib/hooks/use-auth"

interface ExpenseTypeFormDialogProps {
  expenseType: ExpenseType | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExpenseTypeFormDialog({ expenseType, open, onOpenChange }: ExpenseTypeFormDialogProps) {
  const { toast } = useToast()
  const createMutation = useCreateExpenseType()
  const updateMutation = useUpdateExpenseType()

  const { hasPermission } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateExpenseTypeRequest>({
    defaultValues: {
      code: "",
      name: "",
      scope: "shipment",
      capitalizable: false,
    },
  })

  useEffect(() => {
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

  const onSubmit = async (data: CreateExpenseTypeRequest) => {
    try {
      if (expenseType) {
        const updateData: UpdateExpenseTypeRequest = {
          name: data.name,
          capitalizable: data.capitalizable,
        }
        await updateMutation.mutateAsync({ id: expenseType.id, data: updateData })
        toast({
          title: "Success",
          description: "Expense type updated successfully",
        })
      } else {
        await createMutation.mutateAsync(data)
        toast({
          title: "Success",
          description: "Expense type created successfully",
        })
      }
      onOpenChange(false)
      reset()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{expenseType ? "Edit Expense Type" : "Create Expense Type"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code *</Label>
            <Input
              id="code"
              {...register("code", { required: "Code is required" })}
              disabled={!!expenseType}
              placeholder="e.g., freight, customs"
            />
            {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register("name", { required: "Name is required" })} placeholder="e.g., Freight Cost" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="scope">Scope *</Label>
            <select
              id="scope"
              {...register("scope", { required: "Scope is required" })}
              disabled={!!expenseType}
              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="shipment">Shipment</option>
              <option value="batch">Batch</option>
            </select>
            {errors.scope && <p className="text-sm text-destructive">{errors.scope.message}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="capitalizable" {...register("capitalizable")} className="h-4 w-4" />
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
                  (!expenseType && !hasPermission("purchase-expense-type:create")) ||
                  (expenseType !== null && !hasPermission("purchase-expense-type:update"))
                )
              }
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
