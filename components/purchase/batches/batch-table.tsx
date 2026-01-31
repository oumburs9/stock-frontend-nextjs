"use client"

import { useMemo, useState } from "react"
import { useBatches } from "@/lib/hooks/use-batches"
import { useProducts } from "@/lib/hooks/use-products"
import { useShipments } from "@/lib/hooks/use-shipments"
import { usePurchaseOrders } from "@/lib/hooks/use-purchase-orders"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, DollarSign, Eye, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import { AddBatchExpenseDialog } from "./add-batch-expense-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import { formatCurrency } from "@/lib/utils/currency"

interface BatchTableProps {
  globalSearch: string
  productFilter: string
  shipmentFilter: string
  poFilter: string
}

export function BatchTable({
  globalSearch,
  productFilter,
  shipmentFilter,
  poFilter,
}: BatchTableProps) {
  const router = useRouter()
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)
  const [page, setPage] = useState(1)

  const { hasPermission } = useAuth()
  const { data: batches, isLoading: batchesLoading } = useBatches()
  const { data: products, isLoading: productsLoading } = useProducts()
  const { data: shipments } = useShipments()
  const { data: purchaseOrders } = usePurchaseOrders()

  const productMap = useMemo(() => {
    if (!products) return {}
    return products.reduce((acc, p) => {
      acc[p.id] = p.name
      return acc
    }, {} as Record<string, string>)
  }, [products])

  const shipmentMap = useMemo(() => {
    if (!shipments?.data) return {}
    return shipments.data.reduce((acc, s) => {
      acc[s.id] = s.code
      return acc
    }, {} as Record<string, string>)
  }, [shipments])

  const poMap = useMemo(() => {
    if (!purchaseOrders?.data) return {}
    return purchaseOrders.data.reduce((acc, po) => {
      acc[po.id] = po.code
      return acc
    }, {} as Record<string, string>)
  }, [purchaseOrders])

  const filteredBatches = useMemo(() => {
    if (!batches) return []

    let filtered = [...batches]

    if (productFilter) {
      filtered = filtered.filter((b) => b.product_id === productFilter)
    }

    if (shipmentFilter) {
      filtered = filtered.filter((b) => b.shipment_id === shipmentFilter)
    }

    if (poFilter) {
      filtered = filtered.filter((b) => b.shipment_id === null)
    }

    if (globalSearch) {
      const search = globalSearch.toLowerCase()
      filtered = filtered.filter((b) => {
        const productName = productMap[b.product_id]?.toLowerCase() || ""
        const shipmentCode = b.shipment_id
          ? shipmentMap[b.shipment_id]?.toLowerCase() || ""
          : ""
        return (
          productName.includes(search) ||
          shipmentCode.includes(search) ||
          "po only".includes(search)
        )
      })
    }

    return filtered
  }, [
    batches,
    productFilter,
    shipmentFilter,
    poFilter,
    globalSearch,
    productMap,
    shipmentMap,
  ])

  const isLoading = batchesLoading || productsLoading

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!filteredBatches || filteredBatches.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">
            No batches found matching your filters
          </p>
        </CardContent>
      </Card>
    )
  }

  const handleAddExpense = (batchId: string) => {
    setSelectedBatchId(batchId)
    setIsExpenseDialogOpen(true)
  }

  const handleViewDetails = (batchId: string) => {
    router.push(`/purchase/batches/${batchId}`)
  }

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedTransfers = filteredBatches.slice(
    startIndex,
    startIndex + itemsPerPage,
  )
  const totalPages = Math.ceil(filteredBatches.length / itemsPerPage)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Batch List</CardTitle>
          <CardDescription>
            Showing {filteredBatches.length}{" "}
            {filteredBatches.length === 1 ? "batch" : "batches"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Received Date</TableHead>
                  <TableHead className="text-right">Qty Received</TableHead>
                  <TableHead className="text-right">Qty Remaining</TableHead>
                  <TableHead className="text-right">Base Cost</TableHead>
                  <TableHead className="text-right">Landed Cost</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransfers.map((batch) => {
                  const productName =
                    productMap[batch.product_id] || "Unknown Product"
                  const source = batch.shipment_id
                    ? shipmentMap[batch.shipment_id] || "Unknown"
                    : "PO Only"

                  return (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">
                        {productName}
                      </TableCell>
                      <TableCell>
                        {batch.shipment_id ? (
                          <span className="text-sm">
                            Shipment: {source}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Direct from PO
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(batch.received_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {batch.quantity_received}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {batch.quantity_remaining}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(Number(batch.base_unit_cost ?? 0), 'ETB')}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(Number(batch.landed_unit_cost ?? 0), 'ETB')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleViewDetails(batch.id)
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {hasPermission(
                              "product-batch-expense:add",
                            ) && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleAddExpense(batch.id)
                                }
                              >
                                <DollarSign className="mr-2 h-4 w-4" />
                                Add Expense
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredBatches.length > itemsPerPage && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(
                  startIndex + itemsPerPage,
                  filteredBatches.length,
                )}{" "}
                of {filteredBatches.length} transfers
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <Button
                        key={p}
                        variant={page === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(p)}
                        className="w-8 h-8 p-0"
                      >
                        {p}
                      </Button>
                    ),
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage(Math.min(totalPages, page + 1))
                  }
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Cost Information</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <strong>Base Cost:</strong> Original unit cost when received
              </li>
              <li>
                <strong>Landed Cost:</strong> Base cost + allocated batch
                expenses
              </li>
              <li>
                <strong>Source:</strong> Batches from shipments show shipment
                code; direct PO receives show "Direct from PO"
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {selectedBatchId && (
        <AddBatchExpenseDialog
          batchId={selectedBatchId}
          open={isExpenseDialogOpen}
          onOpenChange={setIsExpenseDialogOpen}
        />
      )}
    </>
  )
}
