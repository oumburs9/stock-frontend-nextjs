"use client"

import { useState } from "react"
import { MoreHorizontal, Plus, Search, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { useStockAdjustments } from "@/lib/hooks/use-stock-adjustments"
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
import { StockAdjustmentFormDialog } from "./stock-adjustment-form-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { StockAdjustment } from "@/lib/types/inventory"
import { useAuth } from "@/lib/hooks/use-auth"

export function StockAdjustmentTable() {
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [selectedAdjustment, setSelectedAdjustment] = useState<StockAdjustment | null>(null)

  const { hasPermission } = useAuth()
  const { data: adjustments, isLoading } = useStockAdjustments()

  const filteredAdjustments = adjustments?.filter(
    (a) =>
      a.product.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.toWarehouse?.name || a.toShop?.name || "").toLowerCase().includes(search.toLowerCase()),
  )

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedAdjustments = filteredAdjustments?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((filteredAdjustments?.length || 0) / itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search adjustments..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        {hasPermission("stock.adjustment:create") && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Adjustment
          </Button>)}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Before</TableHead>
              <TableHead>After</TableHead>
              <TableHead>Reason</TableHead>
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
            ) : paginatedAdjustments?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No adjustments found
                </TableCell>
              </TableRow>
            ) : (
              paginatedAdjustments?.map((adj) => (
                <TableRow key={adj.id}>
                  <TableCell className="font-medium">{adj.product.name}</TableCell>
                  <TableCell>{adj.toWarehouse?.name || adj.toShop?.name}</TableCell>
                  <TableCell>
                    <Badge variant={adj.direction === "in" ? "default" : "destructive"}>
                      {adj.direction.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{adj.quantity}</TableCell>
                  <TableCell>{adj.beforeQuantity}</TableCell>
                  <TableCell>{adj.afterQuantity}</TableCell>
                  <TableCell className="text-sm">{adj.reason}</TableCell>
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
                        <DropdownMenuItem onClick={() => setSelectedAdjustment(adj)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredAdjustments && filteredAdjustments.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAdjustments.length)} of{" "}
            {filteredAdjustments.length} adjustments
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

      <StockAdjustmentFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      <Dialog open={!!selectedAdjustment} onOpenChange={(open) => !open && setSelectedAdjustment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjustment Details</DialogTitle>
            <DialogDescription>Complete information about this stock adjustment</DialogDescription>
          </DialogHeader>
          {selectedAdjustment && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Product</div>
                      <div className="font-medium">{selectedAdjustment.product.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">SKU</div>
                      <div className="font-mono text-sm">{selectedAdjustment.product.sku}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-medium">
                      {selectedAdjustment.toWarehouse?.name || selectedAdjustment.toShop?.name}
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Direction</div>
                      <Badge variant={selectedAdjustment.direction === "in" ? "default" : "destructive"}>
                        {selectedAdjustment.direction.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Quantity</div>
                      <div className="text-2xl font-bold">{selectedAdjustment.quantity}</div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 border-t pt-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Before Adjustment</div>
                      <div className="text-lg font-semibold">{selectedAdjustment.beforeQuantity}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">After Adjustment</div>
                      <div className="text-lg font-semibold text-green-600">{selectedAdjustment.afterQuantity}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Reason</div>
                    <div className="font-medium">{selectedAdjustment.reason}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-medium">{new Date(selectedAdjustment.createdAt).toLocaleString()}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => setSelectedAdjustment(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
