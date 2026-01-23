"use client"

import { useState } from "react"
import { MoreHorizontal, Eye, Calculator, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCostings, useComputeCosting } from "@/lib/hooks/use-finance"
import { useInvoices } from "@/lib/hooks/use-finance"
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
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/hooks/use-auth"

interface CostingTableProps {
  searchQuery: string
}

export function CostingTable({ searchQuery }: CostingTableProps) {
  const [page, setPage] = useState(1)
  const router = useRouter()
  const { hasPermission } = useAuth()

  const { data: costings, isLoading } = useCostings()
  const { data: invoices } = useInvoices()
  const computeMutation = useComputeCosting()

  const filteredCostings = costings?.filter((costing) => {
    const invoice = invoices?.find((inv) => inv.id === costing.invoice_id)
    return invoice?.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedCostings = filteredCostings?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((filteredCostings?.length || 0) / itemsPerPage)

  const getInvoiceNumber = (invoiceId: string) => {
    const invoice = invoices?.find((inv) => inv.id === invoiceId)
    return invoice?.invoice_number || invoiceId.slice(0, 8) + "..."
  }

  const handleRecompute = async (invoiceId: string) => {
    if (!hasPermission("costing:compute")) return
    await computeMutation.mutateAsync(invoiceId)
  }

  return (
    <>
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>COGS</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Margin %</TableHead>
                <TableHead>Computed At</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : paginatedCostings?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No costing records found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCostings?.map((costing) => (
                  <TableRow key={costing.id}>
                    <TableCell className="font-mono text-sm">{getInvoiceNumber(costing.invoice_id)}</TableCell>
                    <TableCell className="font-mono">
                      {Number.parseFloat(costing.revenue_amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono">
                      {Number.parseFloat(costing.cogs_amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono font-semibold">
                      {Number.parseFloat(costing.profit_amount).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono">{costing.margin_percent}%</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(costing.created_at).toLocaleString()}
                    </TableCell>
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
                          {hasPermission("invoice:view") && (<DropdownMenuItem onClick={() => router.push(`/finance/invoices/${costing.invoice_id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Invoice
                          </DropdownMenuItem>)}
                          {hasPermission("costing:compute") && (<DropdownMenuItem onClick={() => handleRecompute(costing.invoice_id)}>
                            <Calculator className="h-4 w-4 mr-2" />
                            Recompute
                          </DropdownMenuItem>)}
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

      {filteredCostings && filteredCostings.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCostings.length)} of{" "}
            {filteredCostings.length} records
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
