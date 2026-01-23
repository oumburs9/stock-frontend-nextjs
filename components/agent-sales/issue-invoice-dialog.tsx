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
import { useTaxRules } from "@/lib/hooks/use-finance"
import { SearchableCombobox } from "@/components/shared/searchable-combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/hooks/use-auth"

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
  const { toast } = useToast()
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
    formState: { errors },
  } = useForm<IssueInvoiceRequest>({
    defaultValues: {
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDays: 30,
      taxRuleId: null,
    },
  })

  const handleIssue = async (data: IssueInvoiceRequest) => {
    if (!hasPermission("agent-sale:issue-invoice")) return
    issueInvoice.mutate(
      { id: agentSale.id, data },
      {
        onSuccess: (result) => {
          toast({
            title: "Invoice issued",
            description: "The invoice has been created successfully.",
          })
          onOpenChange(false)
          if (result.invoice_id) {
            router.push(`/finance/invoices/${result.invoice_id}`)
          }
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to issue invoice",
            variant: "destructive",
          })
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              {...register("invoiceDate", { required: "Invoice date is required" })}
            />
            {errors.invoiceDate && <p className="text-sm text-destructive">{errors.invoiceDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDays">Due Days *</Label>
            <Input
              id="dueDays"
              type="number"
              {...register("dueDays", {
                required: "Due days is required",
                valueAsNumber: true,
                min: { value: 0, message: "Must be 0 or more" },
              })}
            />
            {errors.dueDays && <p className="text-sm text-destructive">{errors.dueDays.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Tax Rule</Label>
            <SearchableCombobox
              value={watch("taxRuleId") === null ? "null" : watch("taxRuleId") || ""}
              onChange={(value) => setValue("taxRuleId", value === "null" ? null : value)}
              options={taxRuleOptions}
              placeholder="Select tax rule..."
              searchPlaceholder="Search tax rules..."
              emptyMessage="No tax rules found."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
