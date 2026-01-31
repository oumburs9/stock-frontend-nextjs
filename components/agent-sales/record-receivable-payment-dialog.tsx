"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import type { AxiosError } from "axios"
import { useCreateReceivablePayment } from "@/lib/hooks/use-finance"
import { usePaymentSources } from "@/lib/hooks/use-payment-sources"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { Receivable, CreateReceivablePaymentRequest } from "@/lib/types/finance"
import { formatCurrency } from "@/lib/utils/currency"
import { useAuth } from "@/lib/hooks/use-auth"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"

interface RecordReceivablePaymentDialogProps {
  open: boolean
  receivable: Receivable | null
  onOpenChange: (open: boolean) => void
}

export function RecordReceivablePaymentDialog({ open, receivable, onOpenChange }: RecordReceivablePaymentDialogProps) {
  const toast = useToast()
  const createMutation = useCreateReceivablePayment()
  const { data: paymentSources = [] } = usePaymentSources()
  const { hasPermission } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateReceivablePaymentRequest>({
    defaultValues: {
      receivableId: "",
      paymentDate: new Date().toISOString().split("T")[0],
      amount: "",
      method: "bank",
      paymentSourceId: "",
      reference: null,
    },
  })

  useEffect(() => {
    if (receivable && open) {
      reset({
        receivableId: receivable.id,
        paymentDate: new Date().toISOString().split("T")[0],
        amount: receivable.balance,
        method: "bank",
        paymentSourceId: "",
        reference: null,
      })
      clearErrors()
    }
  }, [receivable, open, reset, clearErrors])

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      reset({
        receivableId: "",
        paymentDate: new Date().toISOString().split("T")[0],
        amount: "",
        method: "bank",
        paymentSourceId: "",
        reference: null,
      })
      clearErrors()
    }
  }

  const onSubmit = (data: CreateReceivablePaymentRequest) => {
    if (!hasPermission("receivable-payment:create")) return

    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Payment recorded", "Payment recorded successfully")
        handleOpenChange(false)
      },
      onError: (e: AxiosError) => {
        const parsed = parseApiError(e)

        if (parsed.type === "validation") {
          Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof CreateReceivablePaymentRequest, { message })
          })
          return
        }

        showApiErrorToast(parsed, toast, "Failed to record payment")
      },
    })
  }

  const activePaymentSources = paymentSources.filter((ps) => ps.is_active)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Receivable Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Balance Due</Label>
            <div className="text-2xl font-bold font-mono">
              {formatCurrency(Number.parseFloat(receivable?.balance || "0"))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                {...register("paymentDate", {
                  onChange: () => clearErrors("paymentDate"),
                })}
              />
              {errors.paymentDate && <p className="text-sm text-destructive">{errors.paymentDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", {
                  onChange: () => clearErrors("amount"),
                })}
              />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method *</Label>
            <Select
              value={watch("method")}
              onValueChange={(value) => {
                setValue("method", value)
                clearErrors("method")
              }}
            >
              <SelectTrigger id="method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="mobile">Mobile Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentSourceId">Payment Source</Label>
            <Select
              value={watch("paymentSourceId") || "none"}
              onValueChange={(value) => {
                setValue("paymentSourceId", value === "none" ? "" : value)
                clearErrors("paymentSourceId")
              }}
            >
              <SelectTrigger id="paymentSourceId">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {activePaymentSources.map((ps) => (
                  <SelectItem key={ps.id} value={ps.id}>
                    {ps.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference</Label>
            <Input
              id="reference"
              {...register("reference", {
                onChange: () => clearErrors("reference"),
              })}
              placeholder="Transaction reference..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
