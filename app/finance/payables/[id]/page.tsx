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
import { usePayable, usePayablePayments } from "@/lib/hooks/use-finance"
import { usePartners } from "@/lib/hooks/use-partners"
import { RecordPayablePaymentDialog } from "@/components/finance/payables/record-payable-payment-dialog"
import { useAuth } from "@/lib/hooks/use-auth"
import { useShipment } from "@/lib/hooks/use-shipments"
import { usePurchaseOrder } from "@/lib/hooks/use-purchase-orders"
import { Separator } from "@/components/ui/separator"
import { useAgentSalesByPayable } from "@/lib/hooks/use-agent-sales"

export default function PayableDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const { data: payable, isLoading } = usePayable(id)
  const { data: payments } = usePayablePayments(id)
  const { data: partners } = usePartners("supplier")
  const { hasPermission } = useAuth()

  const { data: agentSales } = useAgentSalesByPayable(payable?.id ?? null)
  const agentSale = agentSales?.[0] ?? null

  const shipmentId = payable?.purchase_shipment_id ?? null
  const purchaseOrderId = payable?.purchase_order_id ?? null
  const { data: shipment } = useShipment(shipmentId)
  const { data: purchaseOrder } = usePurchaseOrder(purchaseOrderId)

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading payable...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!payable) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Payable not found</p>
        </div>
      </DashboardLayout>
    )
  }

  const supplier = partners?.find((p) => p.id === payable.supplier_id)

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
            <PageHeader title={`Payable ${payable.id.slice(0, 8)}`} description="Payable details and payment history" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Payable Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Supplier:</span>
                <span className="font-medium">{supplier?.name || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payable Date:</span>
                <span>{new Date(payable.payable_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date:</span>
                <span>{new Date(payable.due_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Days:</span>
                <span>{payable.due_days} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency:</span>
                <span className="font-mono">{payable.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={getStatusVariant(payable.status)}>{payable.status.replace("_", " ")}</Badge>
              </div>
              {payable.notes && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground">Notes:</p>
                  <p className="text-sm">{payable.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {shipmentId && shipment && (
            <Card>
              <CardHeader>
                <CardTitle>Related Shipment</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Shipment Code</span>
                  <span className="font-medium">{shipment.code}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline">
                    {shipment.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Arrival Date</span>
                  <span className="text-sm">
                    {shipment.arrival_date
                      ? new Date(shipment.arrival_date).toLocaleDateString()
                      : "—"}
                  </span>
                </div>

                <Separator />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/purchase/shipments/${shipmentId}`)
                  }
                >
                  View Shipment Details
                </Button>
              </CardContent>
            </Card>
          )}
          {purchaseOrderId && purchaseOrder && (
            <Card>
              <CardHeader>
                <CardTitle>Related Purchase Order</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">PO Code</span>
                  <span className="font-medium">{purchaseOrder.code}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline">
                    {purchaseOrder.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Order Date</span>
                  <span className="text-sm">
                    {new Date(purchaseOrder.order_date).toLocaleDateString()}
                  </span>
                </div>

                <Separator />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    router.push(`/purchase/orders/${purchaseOrderId}`)
                  }
                >
                  View Purchase Order
                </Button>
              </CardContent>
            </Card>
          )}

          {agentSale && (
            <Card>
              <CardHeader>
                <CardTitle>Related Agent Sale</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sale Code</span>
                  <span className="font-medium">{agentSale.code}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline">
                    {agentSale.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sale Date</span>
                  <span className="text-sm">
                    {new Date(agentSale.sale_date).toLocaleDateString()}
                  </span>
                </div>

                <Separator />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/agent-sales/${agentSale.id}`)}
                >
                  View Agent Sale
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Amount Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Original Amount:</span>
                <span className="font-mono">{Number.parseFloat(payable.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid:</span>
                <span className="font-mono text-green-600">
                  {(Number.parseFloat(payable.amount) - Number.parseFloat(payable.balance)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-semibold">Balance:</span>
                <span className="font-mono text-xl font-bold">
                  {payable.currency} {Number.parseFloat(payable.balance).toLocaleString()}
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
                <CardDescription>All payments recorded for this payable</CardDescription>
              </div>
              {hasPermission("payable:record-payment") && payable.status !== "paid" && (
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

      <RecordPayablePaymentDialog payable={payable} open={showPaymentDialog} onOpenChange={setShowPaymentDialog} />
    </DashboardLayout>
  )
}
