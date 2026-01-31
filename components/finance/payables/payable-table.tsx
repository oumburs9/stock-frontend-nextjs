"use client"

import { useState } from "react"
import { MoreHorizontal, Eye, DollarSign, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { usePayables } from "@/lib/hooks/use-finance"
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
import { RecordPayablePaymentDialog } from "./record-payable-payment-dialog"
import type { Payable } from "@/lib/types/finance"
import { useAuth } from "@/lib/hooks/use-auth"

interface PayableTableProps {
  searchQuery: string
  statusFilter: string
}

export function PayableTable({ searchQuery, statusFilter }: PayableTableProps) {
  const [page, setPage] = useState(1)
  const [paymentDialog, setPaymentDialog] = useState<{ open: boolean; payable: Payable | null }>({
    open: false,
    payable: null,
  })
  const router = useRouter()

  const { data: payables, isLoading, error } = usePayables()
  const { data: suppliers } = usePartners("supplier")
  const { hasPermission } = useAuth()

  const filteredPayables = payables?.filter((pay) => {
    const matchesSearch =
      suppliers
        ?.find((s) => s.id === pay.supplier_id)
        ?.name.toLowerCase()
        .includes(searchQuery.toLowerCase()) || pay.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || pay.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedPayables = filteredPayables?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((filteredPayables?.length || 0) / itemsPerPage)

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers?.find((s) => s.id === supplierId)
    return supplier?.name || supplierId.slice(0, 8) + "..."
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
        <AlertDescription>Failed to load payables. Please check your API connection and try again.</AlertDescription>
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
                <TableHead>Supplier</TableHead>
                <TableHead>Source</TableHead>
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
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Loading payables...
                  </TableCell>
                </TableRow>
              ) : paginatedPayables?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No payables found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPayables?.map((payable) => (
                  <TableRow key={payable.id}>
                    <TableCell>{getSupplierName(payable.supplier_id)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {payable.purchase_order_id ? "Purchase Order" : payable.purchase_shipment_id ? "Shipment" : "Agent Sale"}
                    </TableCell>
                    <TableCell className="font-mono">
                      {payable.currency} {Number.parseFloat(payable.amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono font-semibold">
                      {payable.currency} {Number.parseFloat(payable.balance).toLocaleString()}
                    </TableCell>
                    <TableCell>{new Date(payable.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(payable.status)}</TableCell>
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
                          <DropdownMenuItem onClick={() => router.push(`/finance/payables/${payable.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {hasPermission("payable:record-payment") && payable.status !== "paid" && (
                            <DropdownMenuItem onClick={() => setPaymentDialog({ open: true, payable })}>
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

      {filteredPayables && filteredPayables.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPayables.length)} of{" "}
            {filteredPayables.length} payables
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

      <RecordPayablePaymentDialog
        open={paymentDialog.open}
        payable={paymentDialog.payable}
        onOpenChange={(open) => !open && setPaymentDialog({ open: false, payable: null })}
      />
    </>
  )
}
