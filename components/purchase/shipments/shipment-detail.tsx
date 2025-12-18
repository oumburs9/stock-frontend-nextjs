"use client"

import { useState } from "react"
import { useShipment, useCloseShipment } from "@/lib/hooks/use-shipments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Package, DollarSign, CheckCircle } from "lucide-react"
import { AddExpenseDialog } from "./add-expense-dialog"
import { ReceiveShipmentDialog } from "./receive-shipment-dialog"
import { UpdateShipmentDialog } from "./update-shipment-dialog"
import { useToast } from "@/hooks/use-toast"

interface ShipmentDetailProps {
  id: string
}

export function ShipmentDetail({ id }: ShipmentDetailProps) {
  const { data: shipment, isLoading } = useShipment(id)
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const closeShipmentMutation = useCloseShipment()
  const { toast } = useToast()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p>Shipment not found</p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      partially_received: "default",
      received: "outline",
      closed: "destructive",
    }
    return <Badge variant={variants[status] || "secondary"}>{status.replace("_", " ")}</Badge>
  }

  const canReceive = shipment.status !== "closed"
  const canClose = shipment.status === "received"
  const canUpdate = shipment.status !== "received" && shipment.status !== "closed"

  const handleClose = async () => {
    try {
      await closeShipmentMutation.mutateAsync(id)
      toast({
        title: "Success",
        description: "Shipment closed successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to close shipment",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{shipment.code}</CardTitle>
              <CardDescription className="mt-1">
                <Badge variant={shipment.type === "import" ? "default" : "secondary"} className="mr-2">
                  {shipment.type}
                </Badge>
                {getStatusBadge(shipment.status)}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {canUpdate && (
                <Button variant="outline" size="sm" onClick={() => setIsUpdateDialogOpen(true)}>
                  Update Details
                </Button>
              )}
              {canReceive && (
                <Button size="sm" onClick={() => setIsReceiveDialogOpen(true)}>
                  <Package className="h-4 w-4 mr-2" />
                  Receive Items
                </Button>
              )}
              {canClose && (
                <Button size="sm" variant="outline" onClick={handleClose}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Close Shipment
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Supplier ID</p>
              <p className="font-mono text-sm mt-1">{shipment.supplier_id.slice(0, 16)}...</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Currency</p>
              <p className="font-medium mt-1">{shipment.currency}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Departure Date</p>
              <p className="font-medium mt-1">
                {shipment.departure_date ? new Date(shipment.departure_date).toLocaleDateString() : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Arrival Date</p>
              <p className="font-medium mt-1">
                {shipment.arrival_date ? new Date(shipment.arrival_date).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Shipment Items</CardTitle>
          <CardDescription>Products included in this shipment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Expected Qty</TableHead>
                  <TableHead>Received Qty</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipment.items.map((item) => {
                  const receivedQty = Number.parseFloat(item.quantity_received)
                  const expectedQty = Number.parseFloat(item.quantity_expected)
                  const isFullyReceived = receivedQty >= expectedQty
                  const isPartiallyReceived = receivedQty > 0 && receivedQty < expectedQty

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.product_id.slice(0, 8)}...</TableCell>
                      <TableCell>{item.quantity_expected}</TableCell>
                      <TableCell className="font-medium">{item.quantity_received}</TableCell>
                      <TableCell>
                        {isFullyReceived ? (
                          <Badge variant="outline">Fully Received</Badge>
                        ) : isPartiallyReceived ? (
                          <Badge variant="default">Partially Received</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Shipment Expenses</CardTitle>
              <CardDescription>Additional costs for this shipment</CardDescription>
            </div>
            {shipment.status !== "closed" && (
              <Button size="sm" variant="outline" onClick={() => setIsExpenseDialogOpen(true)}>
                <DollarSign className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {shipment.expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No expenses added yet</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipment.expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.type}</TableCell>
                      <TableCell className="font-mono">{expense.amount}</TableCell>
                      <TableCell>{expense.currency}</TableCell>
                      <TableCell>{new Date(expense.expense_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-muted-foreground">{expense.description || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddExpenseDialog shipmentId={id} open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen} />
      {shipment && (
        <>
          <ReceiveShipmentDialog shipment={shipment} open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen} />
          <UpdateShipmentDialog shipment={shipment} open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen} />
        </>
      )}
    </div>
  )
}
