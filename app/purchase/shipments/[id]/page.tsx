"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ArrowLeft, PackageCheck, XCircle, Search, Plus, ChevronDown } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { ReceiveShipmentDialog } from "@/components/purchase/shipments/receive-shipment-dialog"
import { AddExpenseDialog } from "@/components/purchase/shipments/add-expense-dialog"
import { ShipmentFormDialog } from "@/components/purchase/shipments/shipment-form-dialog"
import { AdjustShipmentExpenseDialog } from "@/components/purchase/shipments/adjust-expense-dialog"
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
import { useShipment, useCloseShipment } from "@/lib/hooks/use-shipments"
import { usePartners } from "@/lib/hooks/use-partners"
import { useProducts } from "@/lib/hooks/use-products"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"



export default function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const [showReceiveDialog, setShowReceiveDialog] = useState(false)
  const [showExpenseDialog, setShowExpenseDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItemForReceive, setSelectedItemForReceive] = useState<string | null>(null)
  const [selectedExpenseForAdjust, setSelectedExpenseForAdjust] = useState<any | null>(null)

  const { data: shipmentData, isLoading: shipmentLoading, error: shipmentError } = useShipment(id)
  const { data: suppliersData = [], isLoading: suppliersLoading } = usePartners("supplier")
  const { data: productsData = [], isLoading: productsLoading } = useProducts()

  const closeMutation = useCloseShipment()

  const shipment = shipmentData 
  const suppliers = suppliersData
  const products = productsData

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId)
    return supplier?.name || supplierId
  }

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    return product?.name || "Unknown Product"
  }

  const getProductSku = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    return product?.sku || "-"
  }

  const getRemainingQuantity = (expected: string, received: string) => {
    const exp = Number.parseFloat(expected || "0")
    const rec = Number.parseFloat(received || "0")
    return Math.max(0, exp - rec).toFixed(2)
  }

  const handleClose = async () => {
    try {
      await closeMutation.mutateAsync(id)
      toast({
        title: "Success",
        description: "Shipment closed successfully",
      })
      setShowCloseConfirm(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to close shipment",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      partially_received: "default",
      received: "outline",
      closed: "destructive",
    }
    return <Badge variant={variants[status] || "secondary"}>{status?.replace("_", " ").toUpperCase()}</Badge>
  }


  const canEditHeader = ["draft", "in_transit", "arrived", "cleared"].includes(shipment?.status)

  const canEditItems = shipment?.status === "draft"
  const canAddExpense = !["received", "closed"].includes(shipment?.status)
  const canReceive = ["arrived", "cleared", "partially_received"].includes(shipment?.status)
  const canClose = shipment?.status === "received"

  const filteredItems = useMemo(() => {
    if (!shipment?.items || shipment.items.length === 0) return []

    if (!searchQuery.trim()) return shipment.items

    const query = searchQuery.toLowerCase()
    return shipment.items.filter((item) => {
      const productName = getProductName(item.product_id).toLowerCase()
      const sku = getProductSku(item.product_id).toLowerCase()
      return productName.includes(query) || sku.includes(query)
    })
  }, [shipment?.items, searchQuery, products])

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

  const totalExpenses = shipment?.expenses
                        .reduce((sum, exp) => {
                          const adjSum = exp.adjustments?.reduce((s, adj) => s + Number.parseFloat(adj.amount), 0) || 0
                          return sum + Number.parseFloat(exp.amount) + adjSum
                        }, 0) || 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/purchase/shipments")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Shipment: {shipment?.code}</h1>
              <p className="text-muted-foreground">View and manage shipment details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(shipment?.status)}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditDialog(true)}
              disabled={!canEditHeader && !canEditItems}
              title={canEditHeader || canEditItems ? "Edit shipment" : "Cannot edit in current status"}
            >
              Edit Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExpenseDialog(true)}
              disabled={!canAddExpense}
              title={canAddExpense ? "Add expense" : "Cannot add expenses to received/closed shipments"}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Expense
            </Button>
            {canReceive && (
              <Button onClick={() => setShowReceiveDialog(true)}>
                <PackageCheck className="h-4 w-4 mr-2" />
                Receive
              </Button>
            )}
            {canClose && (
              <Button
                variant="destructive"
                onClick={() => setShowCloseConfirm(true)}
                disabled={closeMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Close
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
                <span className="font-medium">{getSupplierName(shipment?.supplier_id)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="capitalize">{shipment?.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Departure Date:</span>
                <span>{shipment?.departure_date ? new Date(shipment?.departure_date).toLocaleDateString() : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Arrival Date:</span>
                <span>{shipment?.arrival_date ? new Date(shipment?.arrival_date).toLocaleDateString() : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency:</span>
                <span className="font-mono">{shipment?.currency}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Exchange Rate:</span>
                <span className="font-mono">{shipment?.exchange_rate || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Expenses:</span>
                <span className="font-semibold">ETB { totalExpenses.toFixed(2) }</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(shipment?.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated:</span>
                <span>{new Date(shipment?.updated_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Shipment Items</CardTitle>
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
                  <TableHead className="text-right">Expected</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  {canReceive && <TableHead className="text-center">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    const remaining = getRemainingQuantity(item.quantity_expected, item.quantity_received)
                    const hasRemaining = Number.parseFloat(remaining) > 0
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{getProductName(item.product_id)}</TableCell>
                        <TableCell className="font-mono text-sm">{getProductSku(item.product_id)}</TableCell>
                        <TableCell className="text-right">
                          {Number.parseFloat(item.quantity_expected).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {Number.parseFloat(item.quantity_received).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-orange-600">{remaining}</TableCell>
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
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={canReceive ? 6 : 5} className="text-center text-muted-foreground">
                      {searchQuery ? "No items found matching your search" : "No items in this shipment"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Expenses Table */}
        {shipment?.expenses && shipment?.expenses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Expenses & Adjustments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {shipment?.expenses.map((expense) => {
                  const adjustmentsSum =
                    expense.adjustments?.reduce((sum, adj) => sum + Number.parseFloat(adj.amount), 0) || 0
                  const netAmount = Number.parseFloat(expense.amount) + adjustmentsSum

                  return (
                    <div key={expense.id} className="space-y-3">
                      <div className="flex items-start justify-between p-4 rounded-lg border bg-muted/50">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="uppercase">
                              {expense.type}
                            </Badge>
                            <span className="font-medium">{expense.description || "No description"}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Date: {new Date(expense.expense_date).toLocaleDateString()}</span>
                            <span>Original: {Number.parseFloat(expense.amount).toFixed(2)}</span>
                            {adjustmentsSum !== 0 && (
                              <span
                                className={
                                  adjustmentsSum > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"
                                }
                              >
                                Adjustments: {adjustmentsSum > 0 ? "+" : ""}ETB {adjustmentsSum.toFixed(2)}
                              </span>
                            )}
                            <span className="font-semibold text-foreground">Net: {netAmount.toFixed(2)}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedExpenseForAdjust(expense)}
                          disabled={["received", "closed"].includes(shipment?.status)}
                          title={
                            ["received", "closed"].includes(shipment?.status)
                              ? "Cannot adjust expenses for received/closed shipments"
                              : "Add adjustment to this expense"
                          }
                        >
                          Adjust
                        </Button>
                      </div>

                      {expense.adjustments && expense.adjustments.length > 0 && (
                        <Collapsible>
                          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            <ChevronDown className="h-4 w-4" />
                            Adjustments History ({expense.adjustments.length})
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="ml-6 mt-2 space-y-2">
                              {expense.adjustments.map((adjustment) => (
                                <div
                                  key={adjustment.id}
                                  className="flex items-center justify-between p-3 rounded-md border border-dashed"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant={Number.parseFloat(adjustment.amount) > 0 ? "default" : "destructive"}
                                        className="text-xs"
                                      >
                                        {Number.parseFloat(adjustment.amount) > 0 ? "+" : ""}ETB 
                                        {Number.parseFloat(adjustment.amount).toFixed(2)}
                                      </Badge>
                                      {adjustment.reason && (
                                        <span className="text-sm text-muted-foreground">{adjustment.reason}</span>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {new Date(adjustment.created_at).toLocaleString()} • by{" "}
                                      {adjustment.created_by || "System"}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  )
                })}

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total Expenses (with adjustments):</span>
                    <span className="font-bold text-xl">
                      ETB { totalExpenses.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showEditDialog && (
        <ShipmentFormDialog shipment={shipment} open={showEditDialog} onOpenChange={setShowEditDialog} />
      )}

      {showExpenseDialog && (
        <AddExpenseDialog shipmentId={shipment?.id} open={showExpenseDialog} onOpenChange={setShowExpenseDialog} />
      )}

      {showReceiveDialog && (
        <ReceiveShipmentDialog
          shipment={shipment}
          selectedItemId={selectedItemForReceive}
          open={showReceiveDialog}
          onOpenChange={handleReceiveDialogClose}
        />
      )}

      {selectedExpenseForAdjust && (
        <AdjustShipmentExpenseDialog
          expense={selectedExpenseForAdjust}
          shipmentStatus={shipment?.status}
          open={!!selectedExpenseForAdjust}
          onOpenChange={(open) => !open && setSelectedExpenseForAdjust(null)}
        />
      )}

      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Shipment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close this shipment? This action cannot be undone.
              <span className="block mt-2 font-semibold text-foreground">Shipment: {shipment?.code}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Open</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClose}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Close Shipment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
