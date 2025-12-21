"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ArrowLeft, CheckCircle, XCircle, Plus, Truck, Search, Pencil, Trash2, MoreHorizontal } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import { formatCurrency } from "@/lib/utils/currency"
import { AddSalesOrderItemDialog } from "@/components/sales/orders/add-sales-order-item-dialog"
import { EditSalesOrderItemDialog } from "@/components/sales/orders/edit-sales-order-item-dialog"
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
import { useToast } from "@/hooks/use-toast"
import { useSalesOrder, useConfirmSalesOrder, useDeliverSalesOrder, useCancelSalesOrder } from "@/lib/hooks/use-sales"
import { usePartners } from "@/lib/hooks/use-partners"
import { useProducts } from "@/lib/hooks/use-products"
import { useWarehouses } from "@/lib/hooks/use-warehouses"
import { useShops } from "@/lib/hooks/use-shops"
import { useDeleteSalesOrderItem } from "@/lib/hooks/use-sales"
import type { SalesOrderItem } from "@/lib/types/sales"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export default function SalesOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [showAddItemDialog, setShowAddItemDialog] = useState(false)
  const [showEditItemDialog, setShowEditItemDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<SalesOrderItem | null>(null)
  const [confirmAction, setConfirmAction] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)

  const { data: order } = useSalesOrder(id)
  const { data: customers = [] } = usePartners("customer")
  const { data: products = [] } = useProducts()
  const { data: warehouses = [] } = useWarehouses()
  const { data: shops = [] } = useShops()
  const deleteItemMutation = useDeleteSalesOrderItem()

  const confirmMutation = useConfirmSalesOrder()
  const deliverMutation = useDeliverSalesOrder()
  const cancelMutation = useCancelSalesOrder()

  const filteredItems = useMemo(() => {
    if (!order?.items || order.items.length === 0) return []

    if (!searchQuery.trim()) return order.items

    const query = searchQuery.toLowerCase()
    return order.items.filter((item) => {
      const productName = products.find((p) => p.id === item.product_id)?.name || "Unknown Product"
      const sku = products.find((p) => p.id === item.product_id)?.sku || "-"
      return productName.toLowerCase().includes(query) || sku.toLowerCase().includes(query)
    })
  }, [order, searchQuery, products])

  const totalAmount = order?.items.reduce((sum, item) => sum + Number.parseFloat(item.total_price), 0) || 0

  const canAddItems = order?.status === "draft"
  const canEditItems = order?.status === "draft" || order?.status === "confirmed" || order?.status === "reserved"
  const canDeleteItems = order?.status === "draft" || order?.status === "confirmed" || order?.status === "reserved"
  const canConfirm = order?.status === "draft"
  const canDeliver = order?.status === "confirmed" || order?.status === "reserved"
  const canCancel = order?.status !== "delivered" && order?.status !== "cancelled"

  const getCustomerName = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId)
    return customer?.name || "Unknown Customer"
  }

  const getLocationName = () => {
    if (order?.warehouse_id) {
      const warehouse = warehouses.find((w) => w.id === order.warehouse_id)
      return warehouse ? `Warehouse: ${warehouse.name}` : `Warehouse ID: ${order.warehouse_id.slice(0, 8)}`
    }
    if (order?.shop_id) {
      const shop = shops.find((s) => s.id === order.shop_id)
      return shop ? `Shop: ${shop.name}` : `Shop ID: ${order.shop_id.slice(0, 8)}`
    }
    return "Unknown Location"
  }

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    return product?.name || "Unknown Product"
  }

  const getProductSku = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    return product?.sku || "-"
  }

  const handleConfirm = async () => {
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

  const handleDeliver = async () => {
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

  const handleCancel = async () => {
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

  const handleDeleteItem = async () => {
    if (!deleteItemId) return

    try {
      await deleteItemMutation.mutateAsync({
        orderId: order.id,
        itemId: deleteItemId,
      })
      toast({
        title: "Success",
        description: "Item removed from sales order successfully",
      })
      setDeleteItemId(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete item",
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
    return <Badge variant={variants[status] || "secondary"}>{status.toUpperCase()}</Badge>
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/sales/orders")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Sales Order: {order.code}</h1>
              <p className="text-muted-foreground">View and manage sales order details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(order.status)}
            {canConfirm && (
              <Button onClick={() => setConfirmAction("confirm")}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm
              </Button>
            )}
            {canDeliver && (
              <Button onClick={() => setConfirmAction("deliver")}>
                <Truck className="h-4 w-4 mr-2" />
                Deliver
              </Button>
            )}
            {canCancel && (
              <Button variant="destructive" onClick={() => setConfirmAction("cancel")}>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">{getCustomerName(order.customer_id)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium">{getLocationName()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date:</span>
                <span>{new Date(order.order_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency:</span>
                <span className="font-mono">{order.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Terms:</span>
                <span className="font-mono">{order.payment_terms}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(order.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated:</span>
                <span>{new Date(order.updated_at).toLocaleString()}</span>
              </div>
              {order.notes && (
                <div className="pt-2">
                  <span className="text-muted-foreground block mb-1">Notes:</span>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order Items</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                {canAddItems && (
                  <Button size="sm" onClick={() => setShowAddItemDialog(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span>List Price</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[250px]">
                            <p className="text-sm">
                              The standard selling price before any discounts or pricing rules are applied
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableHead>
                    <TableHead className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span>Unit Price</span>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[250px]">
                            <p className="text-sm">
                              The actual selling price after applying discounts and pricing rules
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    {canEditItems && <TableHead className="text-center">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length > 0 ? (
                    <>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{getProductName(item.product_id)}</TableCell>
                          <TableCell className="font-mono text-sm">{getProductSku(item.product_id)}</TableCell>
                          <TableCell className="text-right">{Number.parseFloat(item.quantity).toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(Number.parseFloat(item.list_price))}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(Number.parseFloat(item.unit_price))}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.discount_amount !== "0" ? (
                              <span className="text-green-600">
                                -{formatCurrency(Number.parseFloat(item.discount_amount))}
                              </span>
                            ) : item.discount_percent !== "0" ? (
                              <span className="text-green-600">
                                -{Number.parseFloat(item.discount_percent).toFixed(1)}%
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(Number.parseFloat(item.total_price))}
                          </TableCell>
                          {canEditItems && (
                            <TableCell className="text-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedItem(item)
                                      setShowEditItemDialog(true)
                                    }}
                                  >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit Item
                                  </DropdownMenuItem>
                                  {canDeleteItems && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => setDeleteItemId(item.id)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Item
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={canEditItems ? 7 : 6} className="text-right font-semibold text-lg">
                          Grand Total:
                        </TableCell>
                        <TableCell className="text-right font-semibold text-lg">
                          {formatCurrency(totalAmount)} {order.currency}
                        </TableCell>
                        {canEditItems && <TableCell />}
                      </TableRow>
                    </>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={canEditItems ? 8 : 7} className="text-center text-muted-foreground">
                        {searchQuery ? "No items found matching your search" : "No items in this order"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      {showAddItemDialog && (
        <AddSalesOrderItemDialog
          salesOrderId={order.id}
          warehouseId={order.warehouse_id}
          shopId={order.shop_id}
          open={showAddItemDialog}
          onOpenChange={setShowAddItemDialog}
        />
      )}

      {showEditItemDialog && selectedItem && (
        <EditSalesOrderItemDialog
          salesOrderId={order.id}
          item={selectedItem}
          open={showEditItemDialog}
          onOpenChange={setShowEditItemDialog}
        />
      )}

      {/* Confirm Actions */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "confirm"
                ? "Confirm Sales Order?"
                : confirmAction === "deliver"
                  ? "Deliver Sales Order?"
                  : "Cancel Sales Order?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "confirm"
                ? "Are you sure you want to confirm this sales order? Items will be ready for delivery."
                : confirmAction === "deliver"
                  ? "Are you sure you want to deliver this sales order? Stock will be deducted using FIFO method."
                  : "Are you sure you want to cancel this sales order? This action cannot be undone."}
              <span className="block mt-2 font-semibold text-foreground">Order: {order.code}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep It</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmAction === "confirm") handleConfirm()
                else if (confirmAction === "deliver") handleDeliver()
                else if (confirmAction === "cancel") handleCancel()
              }}
              className={
                confirmAction === "cancel" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""
              }
            >
              Yes, {confirmAction === "confirm" ? "Confirm" : confirmAction === "deliver" ? "Deliver" : "Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Item Confirmation Dialog */}
      <AlertDialog open={!!deleteItemId} onOpenChange={(open) => !open && setDeleteItemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from the sales order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
