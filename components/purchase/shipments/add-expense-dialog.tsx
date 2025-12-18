"use client"

import { useForm } from "react-hook-form"
import { useState } from "react"
import { useAddShipmentExpense } from "@/lib/hooks/use-shipments"
import { useExpenseTypes } from "@/lib/hooks/use-expense-types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SearchableCombobox } from "@/components/shared/searchable-combobox"
import type { AddShipmentExpenseRequest } from "@/lib/types/purchase"
import { useToast } from "@/hooks/use-toast"

interface AddExpenseDialogProps {
  shipmentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddExpenseDialog({ shipmentId, open, onOpenChange }: AddExpenseDialogProps) {
  const { toast } = useToast()
  const addExpenseMutation = useAddShipmentExpense()

  const { data: expenseTypes = [] } = useExpenseTypes({ scope: "shipment", active: true})
  console.log("expenseTypes: " ,expenseTypes )

  const [selectedExpenseType, setSelectedExpenseType] = useState<string>("")

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddShipmentExpenseRequest>({
    defaultValues: {
      expense_type_id: "",
      amount: "",
      description: "",
    },
  })

  const onSubmit = async (data: AddShipmentExpenseRequest) => {
    try {
      await addExpenseMutation.mutateAsync({ id: shipmentId, data })
      toast({
        title: "Success",
        description: "Expense added successfully",
      })
      onOpenChange(false)
      reset()
      setSelectedExpenseType("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add expense",
        variant: "destructive",
      })
    }
  }

  // const handleExpenseTypeChange = (value: string) => {
  //   setSelectedExpenseType(value)
  //   const expenseType = expenseTypes.find((et) => et.id === value)
  //   if (expenseType) {
  //     setValue("type", expenseType.code)
  //   }
  // }

  const handleExpenseTypeChange = (value: string) => {
    setSelectedExpenseType(value)
    setValue("expense_type_id", value, { shouldValidate: true })
}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Shipment Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expense-type">Expense Type *</Label>
            <SearchableCombobox
              value={selectedExpenseType}
              onChange={handleExpenseTypeChange}
              options={expenseTypes.map((et) => ({
                value: et.id,
                label: `${et.name} (${et.code})`,
              }))}
              placeholder="Select expense type..."
              searchPlaceholder="Search expense types..."
              emptyMessage="No expense types found"
            />
            {!selectedExpenseType && <p className="text-sm text-destructive">Expense type is required</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register("amount", {
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be positive" },
              })}
              placeholder="0.00"
            />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Optional notes about this expense"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                reset()
                setSelectedExpenseType("")
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addExpenseMutation.isPending || !selectedExpenseType}>
              {addExpenseMutation.isPending ? "Adding..." : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
