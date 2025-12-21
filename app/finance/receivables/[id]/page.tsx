"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus } from "lucide-react"
import { useReceivable, useReceivablePayments } from "@/lib/hooks/use-finance"
import { usePartners } from "@/lib/hooks/use-partners"
import { RecordReceivablePaymentDialog } from "@/components/finance/receivables/record-receivable-payment-dialog"

export default function ReceivableDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const { data: receivable, isLoading } = useReceivable(id)
  const { data: payments } = useReceivablePayments(id)
  const { data: partners } = usePartners("customer")

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading receivable...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!receivable) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Receivable not found</p>
        </div>
      </DashboardLayout>
    )
  }

  const partner = partners?.find((p) => p.id === receivable.partner_id)

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "partially_paid":
        return "secondary"
      case "open":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <PageHeader
              title={`Receivable ${receivable.id.slice(0, 8)}`}
              description="Receivable details and payment history"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Receivable Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">{partner?.name || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice ID:</span>
                <Button
                  variant="link"
                  className="h-auto p-0 font-mono"
                  onClick={() => router.push(`/finance/invoices/${receivable.invoice_id}`)}
                >
                  {receivable.invoice_id.slice(0, 12)}...
                </Button>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date:</span>
                <span>{new Date(receivable.due_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={getStatusVariant(receivable.status)}>{receivable.status.replace("_", " ")}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Amount Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original Amount:</span>
                <span className="font-mono">{Number.parseFloat(receivable.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid:</span>
                <span className="font-mono text-green-600">
                  {(Number.parseFloat(receivable.amount) - Number.parseFloat(receivable.balance)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-semibold">Balance:</span>
                <span className="font-mono text-xl font-bold">
                  ETB {Number.parseFloat(receivable.balance).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>All payments recorded for this receivable</CardDescription>
              </div>
              {receivable.status !== "paid" && (
                <Button onClick={() => setShowPaymentDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {payments && payments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-mono">{Number.parseFloat(payment.amount).toLocaleString()}</TableCell>
                      <TableCell className="capitalize">{payment.method}</TableCell>
                      <TableCell className="font-mono text-sm">{payment.reference || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No payments recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <RecordReceivablePaymentDialog
        receivable={receivable}
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
      />
    </DashboardLayout>
  )
}
