"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useInvoice } from "@/lib/hooks/use-finance"
import { formatCurrency } from "@/lib/utils/currency"

interface InvoiceViewerProps {
  invoiceId: string
}

export function InvoiceViewer({ invoiceId }: InvoiceViewerProps) {
  const { data: invoice, isLoading } = useInvoice(invoiceId)

  if (isLoading) {
    return <div className="text-muted-foreground">Loading invoice...</div>
  }

  if (!invoice) {
    return <div className="text-muted-foreground">Invoice not found</div>
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Invoice {invoice.invoice_number}</CardTitle>
            </div>
            <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>{invoice.status.toUpperCase()}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Date:</span>
                <span>{new Date(invoice.invoice_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date:</span>
                <span>{new Date(invoice.due_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items &&
                invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-right">{Number.parseFloat(item.quantity).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number.parseFloat(item.unit_price))}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number.parseFloat(item.line_total))}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 pt-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>{formatCurrency(Number.parseFloat(invoice.subtotal))}</span>
          </div>
          {invoice.tax_amount && Number.parseFloat(invoice.tax_amount) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax:</span>
              <span>{formatCurrency(Number.parseFloat(invoice.tax_amount))}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span>Total:</span>
            <span>{formatCurrency(Number.parseFloat(invoice.total_amount))}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
