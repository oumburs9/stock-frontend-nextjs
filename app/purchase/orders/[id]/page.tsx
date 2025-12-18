"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ArrowLeft, CheckCircle, XCircle, PackageCheck, Search } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { PurchaseOrderReceiveDialog } from "@/components/purchase/orders/purchase-order-receive-dialog"
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
import { usePurchaseOrder, useApprovePurchaseOrder, useCancelPurchaseOrder } from "@/lib/hooks/use-purchase-orders"
import { useBatches } from "@/lib/hooks/use-batches"
import { usePartners } from "@/lib/hooks/use-partners"
import { useProducts } from "@/lib/hooks/use-products"


export default function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [showReceiveDialog, setShowReceiveDialog] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItemForReceive, setSelectedItemForReceive] = useState<string | null>(null)

  const { data: poData, isLoading } = usePurchaseOrder(id)
  const { data: suppliersData = [] } = usePartners("supplier")
  const { data: productsData = [] } = useProducts()
  const { data: batchesData = [] } = useBatches()

  const approveMutation = useApprovePurchaseOrder()
  const cancelMutation = useCancelPurchaseOrder()
  
  
  const getProductName = (productId: string) => {
    const product = productsData.find((p) => p.id === productId)
    return product?.name || "Unknown Product"
  }
  
  const getProductSku = (productId: string) => {
    const product = productsData.find((p) => p.id === productId)
    return product?.sku || "-"
  }
  
  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId)
    return supplier?.name || "Unknown Supplier"
  }
  const getReceivedQuantity = (productId: string) => {
    const productBatches = batches.filter((b: any) => b.product_id === productId && !b.shipment_id)
    const total = productBatches.reduce((sum: number, b: any) => {
      return sum + Number.parseFloat(b.quantity_received || "0")
    }, 0)
    return total.toFixed(2)
  }

  const getRemainingQuantity = (productId: string, orderedQty: string) => {
    const received = Number.parseFloat(getReceivedQuantity(productId))
    const ordered = Number.parseFloat(orderedQty || "0")
    const remaining = Math.max(0, ordered - received)
    return remaining.toFixed(2)
  }

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(po.id)
      toast({
        title: "Success",
        description: "Purchase order approved successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve purchase order",
        variant: "destructive",
      })
    }
  }

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(po.id)
      toast({
        title: "Success",
        description: "Purchase order cancelled successfully",
      })
      setShowCancelConfirm(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel purchase order",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      approved: "default",
      cancelled: "destructive",
      received: "outline",
    }
    return <Badge variant={variants[status] || "secondary"}>{status.toUpperCase()}</Badge>
  }
  const filteredItems = useMemo(() => {
    if (!poData?.items || poData.items.length === 0) return []

    if (!searchQuery.trim()) return poData.items

    const query = searchQuery.toLowerCase()
    return poData.items.filter((item) => {
      const productName = getProductName(item.product_id).toLowerCase() ?? ""
      const sku = getProductSku(item.product_id).toLowerCase() ?? ""
      return productName.includes(query) || sku.includes(query)
    })
  }, [poData?.items, searchQuery, productsData])


  if (isLoading || !poData) {
    return (
      <DashboardLayout>
        <div className="p-6 text-muted-foreground">
          Loading purchase order…
        </div>
      </DashboardLayout>
    )
  }

  const po = poData
  const suppliers = suppliersData ?? []
  const products = productsData ?? []
  const batches = batchesData ?? []


  const canReceive = po.status === "approved"
  const canApprove = po.status === "draft"
  const canCancel = po.status === "draft" || po.status === "approved"



  const handleReceiveItem = (itemId: string) => {
    setSelectedItemForReceive(itemId)
    setShowReceiveDialog(true)
  }

  const handleReceiveDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedItemForReceive(null)
    }
    setShowReceiveDialog(open)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/purchase/orders")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Purchase Order: {po.code}</h1>
              <p className="text-muted-foreground">View and manage purchase order details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(po.status)}
            {canApprove && (
              <Button onClick={handleApprove} disabled={approveMutation.isPending}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}
            {canReceive && (
              <Button onClick={() => setShowReceiveDialog(true)}>
                <PackageCheck className="h-4 w-4 mr-2" />
                Receive
              </Button>
            )}
            {canCancel && (
              <Button
                variant="destructive"
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancelMutation.isPending}
              >
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
                <span className="text-muted-foreground">Supplier:</span>
                <span className="font-medium">{getSupplierName(po.supplier_id)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date:</span>
                <span>{new Date(po.order_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected Date:</span>
                <span>{po.expected_date ? new Date(po.expected_date).toLocaleDateString() : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency:</span>
                <span className="font-mono">{po.currency}</span>
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
                <span>{new Date(po.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated:</span>
                <span>{new Date(po.updated_at).toLocaleString()}</span>
              </div>
              {po.notes && (
                <div className="pt-2">
                  <span className="text-muted-foreground block mb-1">Notes:</span>
                  <p className="text-sm">{po.notes}</p>
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
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Ordered</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  {canReceive && <TableHead className="text-center">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  <>
                    {filteredItems.map((item) => {
                      const received = getReceivedQuantity(item.product_id)
                      const remaining = getRemainingQuantity(item.product_id, item.quantity)
                      const hasRemaining = Number.parseFloat(remaining) > 0
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{getProductName(item.product_id)}</TableCell>
                          <TableCell className="font-mono text-sm">{getProductSku(item.product_id)}</TableCell>
                          <TableCell className="text-right">{Number.parseFloat(item.quantity).toFixed(2)}</TableCell>
                          <TableCell className="text-right text-green-600">{received}</TableCell>
                          <TableCell className="text-right font-medium text-orange-600">{remaining}</TableCell>
                          <TableCell className="text-right">{Number.parseFloat(item.unit_price).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {Number.parseFloat(item.total_price).toFixed(2)}
                          </TableCell>
                          {canReceive && (
                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReceiveItem(item.id)}
                                disabled={!hasRemaining}
                                title={hasRemaining ? "Receive this item" : "Fully received"}
                              >
                                <PackageCheck className="h-3.5 w-3.5 mr-1" />
                                Receive
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      )
                    })}
                    <TableRow>
                      <TableCell colSpan={canReceive ? 7 : 6} className="text-right font-semibold">
                        Grand Total:
                      </TableCell>
                      <TableCell className="text-right font-semibold text-lg">
                        {po.items.reduce((sum, item) => sum + Number.parseFloat(item.total_price), 0).toFixed(2)}{" "}
                        {po.currency}
                      </TableCell>
                      {canReceive && <TableCell />}
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={canReceive ? 8 : 7} className="text-center text-muted-foreground">
                      {searchQuery ? "No items found matching your search" : "No items in this order"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this purchase order? This action cannot be undone.
              <span className="block mt-2 font-semibold text-foreground">PO: {po.code}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep It</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showReceiveDialog && (
        <PurchaseOrderReceiveDialog
          purchaseOrder={po}
          selectedItemId={selectedItemForReceive}
          open={showReceiveDialog}
          onOpenChange={handleReceiveDialogClose}
        />
      )}
    </DashboardLayout>
  )
}
