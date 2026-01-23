"use client"

import { useState } from "react"
import { MoreHorizontal, Eye, CheckCircle, XCircle, Truck, ChevronLeft, ChevronRight } from "lucide-react"
import { useSalesOrders, useConfirmSalesOrder, useDeliverSalesOrder, useCancelSalesOrder } from "@/lib/hooks/use-sales"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { SalesOrder } from "@/lib/types/sales"
import { useAuth } from "@/lib/hooks/use-auth"

interface SalesOrderTableProps {
  searchQuery: string
  statusFilter: string
}

export function SalesOrderTable({ searchQuery, statusFilter }: SalesOrderTableProps) {
  const [confirmAction, setConfirmAction] = useState<{ type: string; order: SalesOrder } | null>(null)
  const [page, setPage] = useState(1)
  const { toast } = useToast()
  const router = useRouter()
  const { hasPermission } = useAuth()

  const { data: orders, isLoading } = useSalesOrders({
    q: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  })
  const { data: customers } = usePartners("customer")
  const confirmMutation = useConfirmSalesOrder()
  const deliverMutation = useDeliverSalesOrder()
  const cancelMutation = useCancelSalesOrder()

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedOrders = orders?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((orders?.length || 0) / itemsPerPage)

  const getCustomerName = (customerId: string) => {
    const customer = customers?.find((c) => c.id === customerId)
    return customer?.name || customerId.slice(0, 8) + "..."
  }

  const handleConfirm = async (order: SalesOrder) => {
    try {
      await confirmMutation.mutateAsync(order.id)
      toast({
        title: "Success",
        description: "Sales order confirmed successfully",
      })
      setConfirmAction(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to confirm sales order",
        variant: "destructive",
      })
    }
  }

  const handleDeliver = async (order: SalesOrder) => {
    try {
      await deliverMutation.mutateAsync(order.id)
      toast({
        title: "Success",
        description: "Sales order delivered successfully",
      })
      setConfirmAction(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to deliver sales order",
        variant: "destructive",
      })
    }
  }

  const handleCancel = async (order: SalesOrder) => {
    try {
      await cancelMutation.mutateAsync(order.id)
      toast({
        title: "Success",
        description: "Sales order cancelled successfully",
      })
      setConfirmAction(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to cancel sales order",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      confirmed: "default",
      reserved: "outline",
      delivered: "outline",
      cancelled: "destructive",
    }
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  return (
    <>
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Currency</TableHead>
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
              ) : paginatedOrders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No sales orders found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm font-medium">{order.code}</TableCell>
                    <TableCell>{getCustomerName(order.customer_id)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {order.warehouse_id ? `Warehouse` : order.shop_id ? `Shop` : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-mono">{order.currency}</TableCell>
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
                          <DropdownMenuItem onClick={() => router.push(`/sales/orders/${order.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {order.status === "draft" && hasPermission('sales-order:confirm') && (
                            <DropdownMenuItem onClick={() => setConfirmAction({ type: "confirm", order })}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirm
                            </DropdownMenuItem>
                          )}
                          {(order.status === "confirmed" || order.status === "reserved") &&
                            hasPermission('sales-order:deliver') && (
                            <DropdownMenuItem onClick={() => setConfirmAction({ type: "deliver", order })}>
                              <Truck className="h-4 w-4 mr-2" />
                              Deliver
                            </DropdownMenuItem>
                          )}
                          {order.status !== "delivered" && order.status !== "cancelled" &&
                            hasPermission('sales-order:cancel') && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setConfirmAction({ type: "cancel", order })}
                                className="text-destructive"
                              >
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
      </Card>

      {orders && orders.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, orders.length)} of {orders.length} orders
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

      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "confirm"
                ? "Confirm Sales Order?"
                : confirmAction?.type === "deliver"
                  ? "Deliver Sales Order?"
                  : "Cancel Sales Order?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "confirm"
                ? "Are you sure you want to confirm this sales order? Items will be ready for delivery."
                : confirmAction?.type === "deliver"
                  ? "Are you sure you want to deliver this sales order? Stock will be deducted using FIFO."
                  : "Are you sure you want to cancel this sales order? This action cannot be undone."}
              <span className="block mt-2 font-semibold text-foreground">Order: {confirmAction?.order.code}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep It</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmAction?.type === "confirm") handleConfirm(confirmAction.order)
                else if (confirmAction?.type === "deliver") handleDeliver(confirmAction.order)
                else if (confirmAction?.type === "cancel") handleCancel(confirmAction.order)
              }}
              className={
                confirmAction?.type === "cancel"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              Yes,{" "}
              {confirmAction?.type === "confirm" ? "Confirm" : confirmAction?.type === "deliver" ? "Deliver" : "Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
