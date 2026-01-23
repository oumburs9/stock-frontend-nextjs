"use client"

import { useState } from "react"
import { MoreHorizontal, Eye, DollarSign, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useReceivables } from "@/lib/hooks/use-finance"
import { usePartners } from "@/lib/hooks/use-partners"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RecordReceivablePaymentDialog } from "./record-receivable-payment-dialog"
import type { Receivable } from "@/lib/types/finance"
import { useAuth } from "@/lib/hooks/use-auth"

interface ReceivableTableProps {
  searchQuery: string
  statusFilter: string
}

export function ReceivableTable({ searchQuery, statusFilter }: ReceivableTableProps) {
  const [page, setPage] = useState(1)
  const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; receivable: Receivable | null }>({
    open: false,
    receivable: null,
  })
  const router = useRouter()

  const { data: receivables, isLoading, error } = useReceivables()
  const { data: customers } = usePartners("customer")
  const { hasPermission } = useAuth()

  const filteredReceivables = receivables?.filter((rec) => {
    const matchesSearch =
      customers
        ?.find((c) => c.id === rec.partner_id)
        ?.name.toLowerCase()
        .includes(searchQuery.toLowerCase()) || rec.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || rec.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedReceivables = filteredReceivables?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((filteredReceivables?.length || 0) / itemsPerPage)

  const getCustomerName = (partnerId: string) => {
    if (!partnerId) return "Unknown Customer"
    const customer = customers?.find((c) => c.id === partnerId)
    return customer?.name || partnerId.slice(0, 8) + "..."
  }

  const getStatusBadge = (status: string) => {
    if (status === "paid") return <Badge variant="outline">Paid</Badge>
    if (status === "partially_paid") return <Badge variant="default">Partially Paid</Badge>
    return <Badge variant="secondary">Open</Badge>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load receivables. Please check your API connection and try again.</AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Loading receivables...
                  </TableCell>
                </TableRow>
              ) : paginatedReceivables?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No receivables found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedReceivables?.map((receivable) => (
                  <TableRow key={receivable.id}>
                    <TableCell>{getCustomerName(receivable.partner_id)}</TableCell>
                    <TableCell className="font-mono">{Number.parseFloat(receivable.amount).toLocaleString()}</TableCell>
                    <TableCell className="font-mono font-semibold">
                      {Number.parseFloat(receivable.balance).toLocaleString()}
                    </TableCell>
                    <TableCell>{new Date(receivable.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(receivable.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/finance/receivables/${receivable.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {hasPermission("receivable:record-payment") && receivable.status !== "paid" && (
                            <DropdownMenuItem onClick={() => setPaymentDialog({ open: true, receivable })}>
                              <DollarSign className="h-4 w-4 mr-2" />
                              Record Payment
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {filteredReceivables && filteredReceivables.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredReceivables.length)} of{" "}
            {filteredReceivables.length} receivables
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={page === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(p)}
                  className="w-8 h-8 p-0"
                >
                  {p}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <RecordReceivablePaymentDialog
        open={paymentDialog.open}
        receivable={paymentDialog.receivable}
        onOpenChange={(open) => !open && setPaymentDialog({ open: false, receivable: null })}
      />
    </>
  )
}
