"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AgentSale } from "@/lib/types/agent-sales"
import { formatCurrency } from "@/lib/utils/currency"
import { useInvoice } from "@/lib/hooks/use-finance"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useReceivables } from "@/lib/hooks/use-finance"
import { usePayables } from "@/lib/hooks/use-finance"
import { useState } from "react"
import { RecordReceivablePaymentDialog } from "./record-receivable-payment-dialog"
import { RecordPayablePaymentDialog } from "./record-payable-payment-dialog"
import { ReceivablePaymentHistory } from "./receivable-payment-history"
import { PayablePaymentHistory } from "./payable-payment-history"
import { InvoiceViewer } from "./invoice-viewer"
import { useAuth } from "@/lib/hooks/use-auth"

interface AgentSaleFinanceTabProps {
  agentSale: AgentSale
}

export function AgentSaleFinanceTab({ agentSale }: AgentSaleFinanceTabProps) {
  const router = useRouter()
  const { data: invoice } = useInvoice(agentSale.invoice_id || "")
  const { data: receivables = [] } = useReceivables()
  const { data: payables = [] } = usePayables()
  const [showReceivablePaymentDialog, setShowReceivablePaymentDialog] = useState(false)
  const [showPayablePaymentDialog, setShowPayablePaymentDialog] = useState(false)
  const { hasPermission } = useAuth()

  const linkedReceivable = receivables.find((r) => r.invoice_id === agentSale.invoice_id)
  const linkedPayable = payables.find((p) => p.id === agentSale.payable_id)


  return (
    <div className="space-y-4">
      {/* Financial Status */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Customer Payment (Receivable)</span>
              <span className="font-medium">
                {linkedReceivable
                  ? `${formatCurrency((Number.parseFloat(linkedReceivable.amount) - Number.parseFloat(linkedReceivable.balance)))} / ${formatCurrency(Number.parseFloat(linkedReceivable.amount))}`
                  : "N/A"}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{
                  width: linkedReceivable
                    ? `${((Number.parseFloat(linkedReceivable.amount) - Number.parseFloat(linkedReceivable.balance)) / Number.parseFloat(linkedReceivable.amount)) * 100}%`
                    : "0%",
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Principal Payment (Payable)</span>
              <span className="font-medium">
                {linkedPayable
                  ? `${formatCurrency((Number.parseFloat(linkedPayable.amount) - Number.parseFloat(linkedPayable.balance)))} / ${formatCurrency(Number.parseFloat(linkedPayable.amount))}`
                  : "N/A"}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all"
                style={{
                  width: linkedPayable
                    ? `${((Number.parseFloat(linkedPayable.amount) - Number.parseFloat(linkedPayable.balance))/ Number.parseFloat(linkedPayable.amount)) * 100}%`
                    : "0%",
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Commission Type:</span>
                <Badge variant="outline">
                  {agentSale.commission_type === "license_use" ? "License Use" : "Principal Commission"}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Items:</span>
                <span className="font-medium">{agentSale.items?.length || 0}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Total:</span>
                <span className="font-semibold">
                  {formatCurrency(Number.parseFloat(agentSale.gross_total))} {agentSale.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commission Amount:</span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(Number.parseFloat(agentSale.commission_total))} {agentSale.currency}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Net Principal Amount:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(Number.parseFloat(agentSale.net_principal_total))} {agentSale.currency}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Information */}
      {hasPermission("invoice:view") && agentSale.invoice_id && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceViewer invoiceId={agentSale.invoice_id} />
          </CardContent>
        </Card>
      )}

      {/* Receivable Payment */}
      {hasPermission("receivable-payment:view") && linkedReceivable && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Customer Payment</CardTitle>
                {hasPermission("receivable-payment:create") && (<Button size="sm" onClick={() => setShowReceivablePaymentDialog(true)}>
                  Record Payment
                </Button>)}
              </div>
            </CardHeader>
            <CardContent>
              {hasPermission("receivable-payment:view") && (
                <ReceivablePaymentHistory receivableId={linkedReceivable.id} />
              )}
            </CardContent>
          </Card>
          <RecordReceivablePaymentDialog
            open={showReceivablePaymentDialog}
            receivable={linkedReceivable}
            onOpenChange={setShowReceivablePaymentDialog}
          />
        </>
      )}

      {/* Payable Payment */}
      {hasPermission("payable-payment:view") && linkedPayable && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Principal Payment</CardTitle>
                {hasPermission("payable-payment:create") && (<Button size="sm" onClick={() => setShowPayablePaymentDialog(true)}>
                  Record Payment
                </Button>)}
              </div>
            </CardHeader>
            <CardContent>
              {hasPermission("payable-payment:view") && (
                <PayablePaymentHistory payableId={linkedPayable.id} />
              )}
            </CardContent>
          </Card>
          <RecordPayablePaymentDialog
            open={showPayablePaymentDialog}
            payable={linkedPayable}
            onOpenChange={setShowPayablePaymentDialog}
          />
        </>
      )}
    </div>
  )
}
