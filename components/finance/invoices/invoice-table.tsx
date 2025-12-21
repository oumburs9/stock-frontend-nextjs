"use client"

import { useState } from "react"
import { MoreHorizontal, Eye, FileText, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useInvoices } from "@/lib/hooks/use-finance"
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

interface InvoiceTableProps {
  searchQuery: string
}

export function InvoiceTable({ searchQuery }: InvoiceTableProps) {
  const [page, setPage] = useState(1)
  const router = useRouter()

  const { data: invoices, isLoading, error } = useInvoices()
  const { data: customers } = usePartners("customer")

  const filteredInvoices = invoices?.filter(
    (invoice) =>
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customers
        ?.find((c) => c.id === invoice.customer_id)
        ?.name.toLowerCase()
        .includes(searchQuery.toLowerCase()),
  )

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedInvoices = filteredInvoices?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((filteredInvoices?.length || 0) / itemsPerPage)

  const getCustomerName = (customerId: string) => {
    if (!customerId) return "Unknown"
    const customer = customers?.find((c) => c.id === customerId)
    return customer?.name || customerId.slice(0, 8) + "..."
  }

  const getStatusBadge = (status: string) => {
    return status === "issued" ? (
      <Badge variant="default">Issued</Badge>
    ) : (
      <Badge variant="destructive">Cancelled</Badge>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load invoices. Please check your API connection and try again.</AlertDescription>
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
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Invoice Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Loading invoices...
                  </TableCell>
                </TableRow>
              ) : paginatedInvoices?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInvoices?.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{getCustomerName(invoice.customer_id)}</TableCell>
                    <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-mono">
                      {invoice.currency} {Number.parseFloat(invoice.total_amount).toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
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
                          <DropdownMenuItem onClick={() => router.push(`/finance/invoices/${invoice.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/finance/receivables?invoice=${invoice.invoice_number}`)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Receivable
                          </DropdownMenuItem>
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

      {filteredInvoices && filteredInvoices.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredInvoices.length)} of{" "}
            {filteredInvoices.length} invoices
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
    </>
  )
}
