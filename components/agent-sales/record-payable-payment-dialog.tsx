"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useCreatePayablePayment } from "@/lib/hooks/use-finance"
import { usePaymentSources } from "@/lib/hooks/use-payment-sources"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { Payable, CreatePayablePaymentRequest } from "@/lib/types/finance"
import { formatCurrency } from "@/lib/utils/currency"
import { useAuth } from "@/lib/hooks/use-auth"

interface RecordPayablePaymentDialogProps {
  open: boolean
  payable: Payable | null
  onOpenChange: (open: boolean) => void
}

export function RecordPayablePaymentDialog({ open, payable, onOpenChange }: RecordPayablePaymentDialogProps) {
  const { toast } = useToast()
  const createMutation = useCreatePayablePayment()
  const { data: paymentSources = [] } = usePaymentSources()
  const { hasPermission } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatePayablePaymentRequest>({
    defaultValues: {
      payableId: "",
      paymentDate: new Date().toISOString().split("T")[0],
      amount: "",
      method: "bank",
      paymentSourceId: "",
      reference: null,
    },
  })

  useEffect(() => {
    if (payable && open) {
      reset({
        payableId: payable.id,
        paymentDate: new Date().toISOString().split("T")[0],
        amount: payable.balance,
        method: "bank",
        paymentSourceId: "",
        reference: null,
      })
    }
  }, [payable, open, reset])

  const onSubmit = async (data: CreatePayablePaymentRequest) => {
    if (!hasPermission("payable-payment:create")) return
    createMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Payment recorded successfully",
        })
        onOpenChange(false)
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to record payment",
          variant: "destructive",
        })
      },
    })
  }

  const activePaymentSources = paymentSources.filter((ps) => ps.is_active)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Payable Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Balance Due</Label>
            <div className="text-2xl font-bold font-mono">
              {formatCurrency(Number.parseFloat(payable?.balance || "0"))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                {...register("paymentDate", { required: "Payment date is required" })}
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
                  required: "Amount is required",
                  min: { value: 0.01, message: "Amount must be positive" },
                })}
              />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method *</Label>
            <Select value={watch("method")} onValueChange={(value) => setValue("method", value)}>
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
              onValueChange={(value) => setValue("paymentSourceId", value === "none" ? "" : value)}
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
            <Input id="reference" {...register("reference")} placeholder="Transaction reference..." />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
