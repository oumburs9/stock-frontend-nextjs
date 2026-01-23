"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePayablePayments } from "@/lib/hooks/use-finance"
import { formatCurrency } from "@/lib/utils/currency"
import { Badge } from "@/components/ui/badge"

interface PayablePaymentHistoryProps {
  payableId: string
}

export function PayablePaymentHistory({ payableId }: PayablePaymentHistoryProps) {
  const { data: payments = [], isLoading } = usePayablePayments(payableId)

  if (isLoading) {
    return <div className="text-muted-foreground">Loading...</div>
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8 text-muted-foreground">No payments recorded yet</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="text-sm">{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                <TableCell className="font-mono">{formatCurrency(Number.parseFloat(payment.amount))}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {payment.method}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{payment.reference || "-"}</TableCell>
                <TableCell>
                  {/* <Badge variant={payment?.status === "completed" ? "default" : "secondary"}>
                    {payment?.status?.toUpperCase()}
                  </Badge> */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
