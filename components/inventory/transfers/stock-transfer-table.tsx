"use client"

import { useState } from "react"
import { MoreHorizontal, Plus, Search, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { useStockTransfers } from "@/lib/hooks/use-stock-transfers"
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
import { StockTransferFormDialog } from "./stock-transfer-form-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import type { StockTransfer } from "@/lib/types/inventory"

export function StockTransferTable() {
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [selectedTransfer, setSelectedTransfer] = useState<StockTransfer | null>(null)

  const { data: transfers, isLoading } = useStockTransfers()

  const filteredTransfers = transfers?.filter(
    (t) =>
      t.product.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.fromWarehouse?.name || t.fromShop?.name || "").toLowerCase().includes(search.toLowerCase()),
  )

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedTransfers = filteredTransfers?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((filteredTransfers?.length || 0) / itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transfers..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => {
            setIsDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Transfer
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
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
            ) : paginatedTransfers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No transfers found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransfers?.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell className="font-medium">{transfer.product.name}</TableCell>
                  <TableCell>{transfer.fromWarehouse?.name || transfer.fromShop?.name}</TableCell>
                  <TableCell>{transfer.toWarehouse?.name || transfer.toShop?.name}</TableCell>
                  <TableCell className="text-right">{transfer.quantity}</TableCell>
                  <TableCell className="text-sm">{transfer.reason}</TableCell>
                  <TableCell className="text-sm">{new Date(transfer.createdAt).toLocaleDateString()}</TableCell>
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
                        <DropdownMenuItem onClick={() => setSelectedTransfer(transfer)}>
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

      {filteredTransfers && filteredTransfers.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransfers.length)} of{" "}
            {filteredTransfers.length} transfers
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

      <StockTransferFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      <Dialog open={!!selectedTransfer} onOpenChange={(open) => !open && setSelectedTransfer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Details</DialogTitle>
            <DialogDescription>Complete information about this stock transfer</DialogDescription>
          </DialogHeader>
          {selectedTransfer && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Product</div>
                      <div className="font-medium">{selectedTransfer.product.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">SKU</div>
                      <div className="font-mono text-sm">{selectedTransfer.product.sku}</div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm text-muted-foreground">From</div>
                      <div className="font-medium">
                        {selectedTransfer.fromWarehouse?.name || selectedTransfer.fromShop?.name}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">To</div>
                      <div className="font-medium">
                        {selectedTransfer.toWarehouse?.name || selectedTransfer.toShop?.name}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Quantity</div>
                    <div className="text-2xl font-bold">{selectedTransfer.quantity}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Reason</div>
                    <div className="font-medium">{selectedTransfer.reason}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-medium">{new Date(selectedTransfer.createdAt).toLocaleString()}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => setSelectedTransfer(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
