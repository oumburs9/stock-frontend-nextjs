"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useIssueAgentSaleInvoice } from "@/lib/hooks/use-agent-sales"
import type { AgentSale } from "@/lib/types/agent-sales"
import { useToast } from "@/hooks/use-toast"
import { FileText } from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import type { AxiosError } from "axios"
import { useTaxRules } from "@/lib/hooks/use-finance"
import { SearchableCombobox } from "@/components/shared/searchable-combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/hooks/use-auth"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"

interface IssueInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agentSale: AgentSale
}

interface IssueInvoiceRequest {
  invoiceDate: string
  dueDays: number
  taxRuleId: string | null
}

export function IssueInvoiceDialog({ open, onOpenChange, agentSale }: IssueInvoiceDialogProps) {
  const toast = useToast()
  const router = useRouter()
  const issueInvoice = useIssueAgentSaleInvoice()
  const { data: taxRules = [] } = useTaxRules()
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
  } = useForm<IssueInvoiceRequest>({
    defaultValues: {
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDays: 30,
      taxRuleId: null,
    },
  })

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      reset({
        invoiceDate: new Date().toISOString().split("T")[0],
        dueDays: 30,
        taxRuleId: null,
      })
      clearErrors()
    }
  }

  const handleIssue = (data: IssueInvoiceRequest) => {
    if (!hasPermission("agent-sale:issue-invoice")) return

    issueInvoice.mutate(
      { id: agentSale.id, data },
      {
        onSuccess: (result) => {
          toast.success("Invoice issued", "The invoice has been created successfully.")
          handleOpenChange(false)
          if (result.invoice_id) {
            router.push(`/finance/invoices/${result.invoice_id}`)
          }
        },
        onError: (e: AxiosError) => {
          const parsed = parseApiError(e)

          if (parsed.type === "validation") {
            Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
              setError(field as keyof IssueInvoiceRequest, { message })
            })
            return
          }

          showApiErrorToast(parsed, toast, "Failed to issue invoice.")
        },
      },
    )
  }

  const activeTaxRules = taxRules.filter((rule) => rule.is_active)
  const taxRuleOptions = [
    { value: "null", label: "No Tax" },
    ...activeTaxRules.map((rule) => ({
      value: rule.id,
      label: `${rule.name}`,
    })),
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Issue Invoice
          </DialogTitle>
          <DialogDescription>Create an invoice for this confirmed agent sale.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleIssue)} className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sale Code:</span>
              <span className="font-mono">{agentSale.code}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">Invoice Amount:</span>
              <span className="font-semibold">
                {formatCurrency(Number.parseFloat(agentSale.gross_total))} {agentSale.currency}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoiceDate">Invoice Date *</Label>
            <Input
              id="invoiceDate"
              type="date"
              {...register("invoiceDate", {
                onChange: () => clearErrors("invoiceDate"),
              })}
            />
            {errors.invoiceDate && <p className="text-sm text-destructive">{errors.invoiceDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDays">Due Days *</Label>
            <Input
              id="dueDays"
              type="number"
              {...register("dueDays", {
                valueAsNumber: true,
                onChange: () => clearErrors("dueDays"),
              })}
            />
            {errors.dueDays && <p className="text-sm text-destructive">{errors.dueDays.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Tax Rule</Label>
            <SearchableCombobox
              value={watch("taxRuleId") === null ? "null" : watch("taxRuleId") || ""}
              onChange={(value) => {
                setValue("taxRuleId", value === "null" ? null : value)
                clearErrors("taxRuleId")
              }}
              options={taxRuleOptions}
              placeholder="Select tax rule..."
              searchPlaceholder="Search tax rules..."
              emptyMessage="No tax rules found."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={issueInvoice.isPending}>
              {issueInvoice.isPending ? "Creating..." : "Issue Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
