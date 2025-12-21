"use client"

import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calculator, FileText } from "lucide-react"
import { useInvoice, useCostingByInvoice, useComputeCosting } from "@/lib/hooks/use-finance"
import { usePartners } from "@/lib/hooks/use-partners"
import { useProducts } from "@/lib/hooks/use-products"

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data: invoice, isLoading } = useInvoice(id)
  const { data: customers } = usePartners("customer")
  const { data: products } = useProducts()
  const { data: costing, error: costingError } = useCostingByInvoice(id)
  const computeMutation = useComputeCosting()

  const handleComputeCosting = async () => {
    await computeMutation.mutateAsync(id)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading invoice...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Invoice not found</p>
        </div>
      </DashboardLayout>
    )
  }

  const customer = customers?.find((c) => c.id === invoice.customer_id)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <PageHeader title={invoice.invoice_number} description="Invoice details and line items" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">{customer?.name || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Date:</span>
                <span>{new Date(invoice.invoice_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date:</span>
                <span>{new Date(invoice.due_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Days:</span>
                <span>{invoice.due_days} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency:</span>
                <span className="font-mono">{invoice.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={invoice.status === "issued" ? "default" : "destructive"}>{invoice.status}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Amount Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-mono">{Number.parseFloat(invoice.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax Amount:</span>
                <span className="font-mono">{Number.parseFloat(invoice.tax_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-semibold">Total Amount:</span>
                <span className="font-mono text-xl font-bold">
                  {invoice.currency} {Number.parseFloat(invoice.total_amount).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Line Items</CardTitle>
                <CardDescription>Products and quantities on this invoice</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {invoice.items && invoice.items.length > 0 ? (
              <div className="space-y-2">
                {invoice.items.map((item) => {
                  const product = products?.find((p) => p.id === item.product_id)
                  return (
                    <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{product?.name || "Unknown Product"}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × {Number.parseFloat(item.unit_price).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold">{Number.parseFloat(item.line_total).toLocaleString()}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No line items</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Costing & Profitability</CardTitle>
                <CardDescription>Revenue, COGS, and profit analysis</CardDescription>
              </div>
              {!costing && (
                <Button onClick={handleComputeCosting} disabled={computeMutation.isPending}>
                  <Calculator className="mr-2 h-4 w-4" />
                  {computeMutation.isPending ? "Computing..." : "Compute Costing"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {costing ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="font-mono font-semibold">
                    {Number.parseFloat(costing.revenue_amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">COGS:</span>
                  <span className="font-mono">{Number.parseFloat(costing.cogs_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="font-semibold">Profit:</span>
                  <span className="font-mono text-xl font-bold text-green-600">
                    {Number.parseFloat(costing.profit_amount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Margin:</span>
                  <span className="font-mono text-lg font-bold">{costing.margin_percent}%</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No costing data available</p>
                <p className="text-sm">Click "Compute Costing" to calculate profit and margin</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={() => router.push(`/finance/receivables`)}>
            <FileText className="mr-2 h-4 w-4" />
            View Receivables
          </Button>
          <Button variant="outline" onClick={() => router.push(`/sales/orders/${invoice.sales_order_id}`)}>
            View Sales Order
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
