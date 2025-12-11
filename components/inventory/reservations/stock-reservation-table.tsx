"use client"

import { useState } from "react"
import { MoreHorizontal, Search, ChevronLeft, ChevronRight, Check, X, Plus, Eye } from "lucide-react"
import { useStockReservations, useReleaseReservation, useConsumeReservation } from "@/lib/hooks/use-stock-reservations"
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
import { StockReservationFormDialog } from "./stock-reservation-form-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import type { StockReservation } from "@/lib/types/inventory"

export function StockReservationTable() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<StockReservation | null>(null)

  const { data: reservations, isLoading } = useStockReservations()
  const releaseMutation = useReleaseReservation()
  const consumeMutation = useConsumeReservation()

  const filteredReservations = reservations?.filter(
    (r) =>
      r.product.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.warehouse?.name || r.shop?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      r.salesOrderId.toLowerCase().includes(search.toLowerCase()),
  )

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedReservations = filteredReservations?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((filteredReservations?.length || 0) / itemsPerPage)

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      active: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400",
      released: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400",
      consumed: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400",
    }
    return <Badge className={statusClasses[status] || ""}>{status}</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reservations..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Reservation
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Sales Order ID</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
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
            ) : paginatedReservations?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No reservations found
                </TableCell>
              </TableRow>
            ) : (
              paginatedReservations?.map((res) => (
                <TableRow key={res.id}>
                  <TableCell className="font-medium">{res.product.name}</TableCell>
                  <TableCell>{res.warehouse?.name || res.shop?.name}</TableCell>
                  <TableCell className="font-mono text-sm">{res.salesOrderId}</TableCell>
                  <TableCell className="text-right">{res.quantity}</TableCell>
                  <TableCell>{getStatusBadge(res.status)}</TableCell>
                  <TableCell className="text-sm">{new Date(res.createdAt).toLocaleDateString()}</TableCell>
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
                        <DropdownMenuItem onClick={() => setSelectedReservation(res)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {res.status === "active" && (
                          <>
                            <DropdownMenuItem
                              onClick={() => consumeMutation.mutate(res.id)}
                              disabled={consumeMutation.isPending}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Consume
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => releaseMutation.mutate(res.id)}
                              disabled={releaseMutation.isPending}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Release
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

      {filteredReservations && filteredReservations.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredReservations.length)} of{" "}
            {filteredReservations.length} reservations
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

      <StockReservationFormDialog open={open} onOpenChange={setOpen} />

      <Dialog open={!!selectedReservation} onOpenChange={(open) => !open && setSelectedReservation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
            <DialogDescription>Complete information about this stock reservation</DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Product</div>
                      <div className="font-medium">{selectedReservation.product.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">SKU</div>
                      <div className="font-mono text-sm">{selectedReservation.product.sku}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-medium">
                      {selectedReservation.warehouse?.name || selectedReservation.shop?.name}
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Reserved Quantity</div>
                      <div className="text-2xl font-bold">{selectedReservation.quantity}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Status</div>
                      {getStatusBadge(selectedReservation.status)}
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 border-t pt-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Linked Sales Order</div>
                      <div className="font-mono text-sm font-semibold">{selectedReservation.salesOrderId}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Created Date</div>
                      <div className="font-medium">{new Date(selectedReservation.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  {selectedReservation.updatedAt && (
                    <div className="border-t pt-4">
                      <div className="text-sm text-muted-foreground">Last Updated</div>
                      <div className="font-medium">{new Date(selectedReservation.updatedAt).toLocaleString()}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => setSelectedReservation(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
