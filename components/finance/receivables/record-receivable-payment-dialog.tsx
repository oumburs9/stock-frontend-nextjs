"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import type { AxiosError } from "axios"
import { useCreateReceivablePayment } from "@/lib/hooks/use-finance"
import { usePaymentSources } from "@/lib/hooks/use-payment-sources"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Receivable, CreateReceivablePaymentRequest } from "@/lib/types/finance"
import { useAuth } from "@/lib/hooks/use-auth"

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

  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    setFormError(null)

    if (receivable && open) {
      reset({
        receivableId: receivable.id,
        paymentDate: new Date().toISOString().split("T")[0],
        amount: receivable.balance,
        method: "bank",
        paymentSourceId: "",
        reference: null,
      })
    }
  }, [receivable, open, reset])

  const onSubmit = (data: CreateReceivablePaymentRequest) => {
    if (!hasPermission("receivable:record-payment")) return

    setFormError(null)

    const submitData = {
      ...data,
      paymentSourceId: data.paymentSourceId === "none" ? null : data.paymentSourceId,
    }

    createMutation
      .mutateAsync(submitData)
      .then(() => {
        toast.success("Payment recorded")
        onOpenChange(false)
      })
      .catch((e: AxiosError) => {
        const parsed = parseApiError(e)

        if (parsed.type === "validation") {
          Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof CreateReceivablePaymentRequest, { message })
          })
          if (parsed.formError) setFormError(parsed.formError)
          return
        }

        showApiErrorToast(parsed, toast)
      })
  }

  const activePaymentSources = paymentSources.filter((ps) => ps.is_active)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Receivable Payment</DialogTitle>
        </DialogHeader>

        {formError && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Balance Due</Label>
            <div className="text-2xl font-bold font-mono">{receivable?.balance || "0.00"}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input id="paymentDate" type="date" {...register("paymentDate")} />
              {errors.paymentDate?.message && (
                <p className="text-sm text-destructive">{errors.paymentDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input id="amount" type="number" step="0.01" {...register("amount")} />
              {errors.amount?.message && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method *</Label>
            <Select value={watch("method")} onValueChange={(value) => setValue("method", value)}>
              <SelectTrigger id="method">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="mobile">Mobile Payment</SelectItem>
              </SelectContent>
            </Select>
            {errors.method?.message && <p className="text-sm text-destructive">{errors.method.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentSourceId">Payment Source</Label>
            <Select
              value={watch("paymentSourceId") || "none"}
              onValueChange={(value) => setValue("paymentSourceId", value)}
            >
              <SelectTrigger id="paymentSourceId">
                <SelectValue placeholder="Select payment source..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {activePaymentSources.map((ps) => (
                  <SelectItem key={ps.id} value={ps.id}>
                    {ps.name} ({ps.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paymentSourceId?.message && (
              <p className="text-sm text-destructive">{errors.paymentSourceId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference</Label>
            <Input id="reference" {...register("reference")} placeholder="Transaction reference..." />
            {errors.reference?.message && (
              <p className="text-sm text-destructive">{errors.reference.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !hasPermission("receivable:record-payment")}>
              {createMutation.isPending ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
