"use client"

import { useState } from "react"
import { MoreHorizontal, Plus, Search, X, CheckCircle, XCircle, PackageCheck, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { usePurchaseOrders, useApprovePurchaseOrder, useCancelPurchaseOrder } from "@/lib/hooks/use-purchase-orders"
import { usePartners } from "@/lib/hooks/use-partners"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { PurchaseOrderFormDialog } from "./purchase-order-form-dialog"
import { PurchaseOrderReceiveDialog } from "./purchase-order-receive-dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { PurchaseOrder } from "@/lib/types/purchase"

export function PurchaseOrderTable() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [poToReceive, setPoToReceive] = useState<PurchaseOrder | null>(null)
  const [page, setPage] = useState(1)
  const { toast } = useToast()
  const router = useRouter()

  const { data: purchaseOrders, isLoading } = usePurchaseOrders({
    q: search || undefined,
    status: statusFilter || undefined,
  })
  const { data: suppliers } = usePartners("supplier")
  const approveMutation = useApprovePurchaseOrder()
  const cancelMutation = useCancelPurchaseOrder()

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers?.find((s) => s.id === supplierId)
    return supplier?.name || supplierId.slice(0, 8) + "..."
  }

  const handleEdit = (po: PurchaseOrder) => {
    if (po.status !== "draft") {
      toast({
        title: "Cannot Edit",
        description: "Only draft purchase orders can be edited",
        variant: "destructive",
      })
      return
    }
    setSelectedPO(po)
    setIsDialogOpen(true)
  }

  const handleApprove = async (po: PurchaseOrder) => {
    try {
      await approveMutation.mutateAsync(po.id)
      toast({
        title: "Success",
        description: "Purchase order approved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve purchase order",
        variant: "destructive",
      })
    }
  }

  const handleCancel = async (po: PurchaseOrder) => {
    try {
      await cancelMutation.mutateAsync(po.id)
      toast({
        title: "Success",
        description: "Purchase order cancelled successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to cancel purchase order",
        variant: "destructive",
      })
    }
  }

  const handleReceive = (po: PurchaseOrder) => {
    if (po.status !== "approved") {
      toast({
        title: "Cannot Receive",
        description: "Only approved purchase orders can be received",
        variant: "destructive",
      })
      return
    }
    setPoToReceive(po)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      approved: "default",
      cancelled: "destructive",
      received: "outline",
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  const hasFilters = statusFilter

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedOrder = purchaseOrders?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((purchaseOrders?.length || 0) / itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search purchase orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => {
            setSelectedPO(null)
            setIsDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Purchase Order
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1 text-sm border border-input rounded-md bg-background text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {hasFilters && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setStatusFilter("")
            }}
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Expected Date</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedOrder?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No purchase orders found
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrder?.map((po) => (
                <TableRow key={po.id}>
                  <TableCell className="font-mono text-sm font-medium">{po.code}</TableCell>
                  <TableCell>{getSupplierName(po.supplier_id)}</TableCell>
                  <TableCell>{getStatusBadge(po.status)}</TableCell>
                  <TableCell>{new Date(po.order_date).toLocaleDateString()}</TableCell>
                  <TableCell>{po.expected_date ? new Date(po.expected_date).toLocaleDateString() : "-"}</TableCell>
                  <TableCell className="font-mono">{po.currency}</TableCell>
                  <TableCell className="text-right">{po.items.length}</TableCell>
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
                        <DropdownMenuItem onClick={() => router.push(`/purchase/orders/${po.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {po.status === "draft" && (
                          <>
                            <DropdownMenuItem onClick={() => handleEdit(po)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleApprove(po)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                          </>
                        )}
                        {po.status === "approved" && (
                          <DropdownMenuItem onClick={() => handleReceive(po)}>
                            <PackageCheck className="h-4 w-4 mr-2" />
                            Receive
                          </DropdownMenuItem>
                        )}
                        {(po.status === "draft" || po.status === "approved") && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleCancel(po)} className="text-destructive">
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          </>
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
      { purchaseOrders && purchaseOrders.length > itemsPerPage && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, purchaseOrders.length)} of{" "}
              {purchaseOrders.length} transfers
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

      <PurchaseOrderFormDialog purchaseOrder={selectedPO} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      {poToReceive && (
        <PurchaseOrderReceiveDialog
          purchaseOrder={poToReceive}
          open={!!poToReceive}
          onOpenChange={(open) => !open && setPoToReceive(null)}
        />
      )}
    </div>
  )
}
