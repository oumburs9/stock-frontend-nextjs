"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAgentSales } from "@/lib/hooks/use-agent-sales"
import { usePartners } from "@/lib/hooks/use-partners"
import { formatCurrency } from "@/lib/utils/currency"
import { useAuth } from "@/lib/hooks/use-auth"

interface AgentSaleTableProps {
  searchQuery: string
  statusFilter: string
}

export function AgentSaleTable({ searchQuery, statusFilter }: AgentSaleTableProps) {
  const router = useRouter()
  const { data: sales = [], isLoading } = useAgentSales()
  const { data: customers = [] } = usePartners("customer")
  const { data: suppliers = [] } = usePartners("supplier")
   const { hasPermission } = useAuth()

  const filteredSales = useMemo(() => {
    let filtered = [...sales]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((sale) => sale.code.toLowerCase().includes(query))
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((sale) => sale.status === statusFilter)
    }

    return filtered
  }, [sales, searchQuery, statusFilter])

  const getCustomerName = (id: string) => {
    const customer = customers.find((c) => c.id === id)
    return customer?.name || `Customer ${id.slice(0, 8)}`
  }

  const getPrincipalName = (id: string) => {
    const principal = suppliers.find((s) => s.id === id)
    return principal?.name || `Principal ${id.slice(0, 8)}`
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary"> = {
      draft: "secondary",
      confirmed: "default",
    }
    return <Badge variant={variants[status] || "secondary"}>{status.toUpperCase()}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground">Loading agent sales...</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Principal</TableHead>
            <TableHead>Sale Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Gross Total</TableHead>
            <TableHead className="text-right">Commission</TableHead>
            <TableHead className="text-right">Net Principal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSales.length > 0 ? (
            filteredSales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium font-mono">{sale.code}</TableCell>
                <TableCell>{getCustomerName(sale.customer_id)}</TableCell>
                <TableCell>{getPrincipalName(sale.principal_id)}</TableCell>
                <TableCell>{new Date(sale.sale_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {sale.commission_type === "license_use" ? "License Use" : "Principal Commission"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(Number.parseFloat(sale.gross_total))} {sale.currency}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(Number.parseFloat(sale.commission_total))} {sale.currency}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(Number.parseFloat(sale.net_principal_total))} {sale.currency}
                </TableCell>
                <TableCell>{getStatusBadge(sale.status)}</TableCell>
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
                      {hasPermission("agent-sale:view") && (
                        <DropdownMenuItem onClick={() => router.push(`/agent-sales/${sale.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "No agent sales found matching your filters"
                  : "No agent sales yet"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
