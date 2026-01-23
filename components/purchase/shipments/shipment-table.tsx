"use client"

import { useState, useMemo } from "react"
import { MoreHorizontal, Plus, Search, X, Eye, Edit, PackageCheck, FileText, XCircle, ChevronLeft, ChevronRight } from "lucide-react"
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
import { ShipmentFormDialog } from "./shipment-form-dialog"
import { ReceiveShipmentDialog } from "./receive-shipment-dialog"
import { AddExpenseDialog } from "./add-expense-dialog"
import { useToast } from "@/hooks/use-toast"
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
import { useRouter } from "next/navigation"
import { useShipments, useCloseShipment } from "@/lib/hooks/use-shipments"
import { usePartners } from "@/lib/hooks/use-partners"
import { useAuth } from "@/lib/hooks/use-auth"

const DEMO_SUPPLIER_NAMES: Record<string, string> = {
  "1": "ABC Electronics Corp",
  "2": "XYZ Component Supplies",
  "3": "Global Trading Co",
}

export function ShipmentTable() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [selectedShipment, setSelectedShipment] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showReceiveDialog, setShowReceiveDialog] = useState(false)
  const [showExpenseDialog, setShowExpenseDialog] = useState(false)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [page, setPage] = useState(1)
  const [selectedForAction, setSelectedForAction] = useState<any>(null)
  const router = useRouter()
  const { hasPermission } = useAuth()
  const { toast } = useToast()
   const { data: suppliers } = usePartners("supplier")

  const { data: shipments = [] } = useShipments({ q: search, status: statusFilter || undefined, type: typeFilter || undefined })
  const closeMutation = useCloseShipment()
  
  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers?.find((s) => s.id === supplierId)
    return supplier?.name || supplierId.slice(0, 8) + "..."
  }

  const filteredShipments = useMemo(() => {
    return shipments.map((s: any) => ({
      ...s,
      supplier_name:  getSupplierName(s.supplier_id),
    }))
  }, [shipments])


  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      partially_received: "default",
      received: "outline",
      closed: "destructive",
    }
    return <Badge variant={variants[status] || "secondary"}>{status.replace(/_/g, " ")}</Badge>
  }

  const hasFilters = statusFilter || typeFilter

  const handleEdit = (shipment: any) => {
    setSelectedShipment(shipment)
    setIsDialogOpen(true)
  }

  const handleAddExpense = (shipment: any) => {
    setSelectedShipment(shipment)
    setShowExpenseDialog(true)
  }

  const handleReceive = (shipment: any) => {
    setSelectedShipment(shipment)
    setShowReceiveDialog(true)
  }

  const handleClose = (shipment: any) => {
    if (shipment.status !== "received") {
      toast({
        title: "Cannot Close",
        description: "Only fully received shipments can be closed",
        variant: "destructive",
      })
      return
    }
    setSelectedForAction(shipment)
    setShowCloseConfirm(true)
  }

  const confirmClose = async () => {
    if (!selectedForAction) return
    try {
      await closeMutation.mutateAsync(selectedForAction.id)
      toast({
        title: "Success",
        description: "Shipment closed successfully",
      })
      setShowCloseConfirm(false)
      setSelectedForAction(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to close shipment",
        variant: "destructive",
      })
    }
  }

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedShipments = filteredShipments?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((filteredShipments?.length || 0) / itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shipments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {hasPermission("purchase-shipment:create") && (
          <Button
            onClick={() => {
              setSelectedShipment(null)
              setIsDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Shipment
          </Button>)}
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1 text-sm border border-input rounded-md bg-background"
        >
          <option value="">All Types</option>
          <option value="import">Import</option>
          <option value="local">Local</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1 text-sm border border-input rounded-md bg-background"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="partially_received">Partially Received</option>
          <option value="received">Received</option>
          <option value="closed">Closed</option>
        </select>
        {hasFilters && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setTypeFilter("")
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
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Arrival Date</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedShipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No shipments found
                </TableCell>
              </TableRow>
            ) : (
              paginatedShipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-mono text-sm font-medium">{shipment.code}</TableCell>
                  <TableCell>
                    <Badge variant={shipment.type === "import" ? "default" : "secondary"}>{shipment.type}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                  <TableCell className="font-medium">{shipment.supplier_name}</TableCell>
                  <TableCell>
                    {shipment.arrival_date ? new Date(shipment.arrival_date).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell className="text-right">{shipment.items?.length || 0}</TableCell>
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
                        <DropdownMenuItem onClick={() => router.push(`/purchase/shipments/${shipment.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {shipment.status === "draft" && hasPermission("purchase-shipment:update") && (
                          <DropdownMenuItem onClick={() => handleEdit(shipment)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {hasPermission("purchase-shipment-expense:add") && (<DropdownMenuItem onClick={() => handleAddExpense(shipment)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Add Expense
                        </DropdownMenuItem>)}
                        {(shipment.status === "draft" || shipment.status === "partially_received") && hasPermission("purchase-shipment:receive") && (
                          <DropdownMenuItem onClick={() => handleReceive(shipment)}>
                            <PackageCheck className="h-4 w-4 mr-2" />
                            Receive
                          </DropdownMenuItem>
                        )}
                        {shipment.status === "received" && hasPermission("purchase-shipment:close") && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleClose(shipment)} className="text-destructive">
                              <XCircle className="h-4 w-4 mr-2" />
                              Close
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
        
        {filteredShipments && filteredShipments.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredShipments.length)} of{" "}
            {filteredShipments.length} transfers
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

      <ShipmentFormDialog shipment={selectedShipment} open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      {selectedShipment && (
        <>
          <ReceiveShipmentDialog
            shipment={selectedShipment}
            open={showReceiveDialog}
            onOpenChange={setShowReceiveDialog}
          />
          <AddExpenseDialog
            shipmentId={selectedShipment.id}
            open={showExpenseDialog}
            onOpenChange={setShowExpenseDialog}
          />
        </>
      )}

      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Shipment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close this shipment? This action cannot be undone.
              {selectedForAction && (
                <span className="block mt-2 font-semibold text-foreground">Shipment: {selectedForAction.code}</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedForAction(null)}>No, Keep Open</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmClose}
              disabled={!hasPermission("purchase-shipment:close")}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Close Shipment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
