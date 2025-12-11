"use client"

import { useState } from "react"
import { Search, ChevronLeft, ChevronRight, Eye, X } from "lucide-react"
import { useStockTransactions } from "@/lib/hooks/use-stock-transactions"
import { useWarehouses } from "@/lib/hooks/use-warehouses"
import { useShops } from "@/lib/hooks/use-shops"
import { useProducts } from "@/lib/hooks/use-products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import type { StockTransaction } from "@/lib/types/inventory"

export function StockTransactionTable() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [selectedTransaction, setSelectedTransaction] = useState<StockTransaction | null>(null)

  const [productFilter, setProductFilter] = useState<string>("")
  const [warehouseFilter, setWarehouseFilter] = useState<string>("")
  const [shopFilter, setShopFilter] = useState<string>("")
  const [directionFilter, setDirectionFilter] = useState<string>("")
  const [dateFromFilter, setDateFromFilter] = useState<string>("")
  const [dateToFilter, setDateToFilter] = useState<string>("")

  const { data: products } = useProducts()
  const { data: warehouses } = useWarehouses()
  const { data: shops } = useShops()

  const { data: transactions, isLoading } = useStockTransactions({ search })

  const filteredTransactions = transactions?.filter((txn) => {
    if (productFilter && txn.product.id !== productFilter) return false
    if (warehouseFilter && !txn.fromWarehouse?.id && !txn.toWarehouse?.id) return false
    if (warehouseFilter && txn.fromWarehouse?.id !== warehouseFilter && txn.toWarehouse?.id !== warehouseFilter)
      return false
    if (shopFilter && !txn.fromShop?.id && !txn.toShop?.id) return false
    if (shopFilter && txn.fromShop?.id !== shopFilter && txn.toShop?.id !== shopFilter) return false
    if (directionFilter && txn.direction !== directionFilter) return false
    if (dateFromFilter) {
      const txnDate = new Date(txn.createdAt)
      const fromDate = new Date(dateFromFilter)
      if (txnDate < fromDate) return false
    }
    if (dateToFilter) {
      const txnDate = new Date(txn.createdAt)
      const toDate = new Date(dateToFilter)
      toDate.setHours(23, 59, 59, 999)
      if (txnDate > toDate) return false
    }
    return true
  })

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedTransactions = filteredTransactions?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((filteredTransactions?.length || 0) / itemsPerPage)

  const clearFilters = () => {
    setProductFilter("")
    setWarehouseFilter("")
    setShopFilter("")
    setDirectionFilter("")
    setDateFromFilter("")
    setDateToFilter("")
    setPage(1)
  }

  const getDirectionBadge = (direction: string) => {
    switch (direction) {
      case "in":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400">Inbound</Badge>
      case "out":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400">Outbound</Badge>
      case "transfer":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400">Transfer</Badge>
      default:
        return <Badge variant="outline">{direction}</Badge>
    }
  }

  const getLocationDisplay = (txn: StockTransaction, type: "from" | "to"): string => {
    if (type === "from") {
      if (txn.fromWarehouse) return `${txn.fromWarehouse.name} (Warehouse)`
      if (txn.fromShop) return `${txn.fromShop.name} (Shop)`
      return "—"
    } else {
      if (txn.toWarehouse) return `${txn.toWarehouse.name} (Warehouse)`
      if (txn.toShop) return `${txn.toShop.name} (Shop)`
      return "—"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-sm text-muted-foreground">Filters:</span>
        <select
          value={productFilter}
          onChange={(e) => {
            setProductFilter(e.target.value)
            setPage(1)
          }}
          className="h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">All Products</option>
          {products?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.sku})
            </option>
          ))}
        </select>
        <select
          value={warehouseFilter}
          onChange={(e) => {
            setWarehouseFilter(e.target.value)
            setPage(1)
          }}
          className="h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">All Warehouses</option>
          {warehouses?.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <select
          value={shopFilter}
          onChange={(e) => {
            setShopFilter(e.target.value)
            setPage(1)
          }}
          className="h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">All Shops</option>
          {shops?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={directionFilter}
          onChange={(e) => {
            setDirectionFilter(e.target.value)
            setPage(1)
          }}
          className="h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">All Directions</option>
          <option value="in">Inbound</option>
          <option value="out">Outbound</option>
          <option value="transfer">Transfer</option>
        </select>
        <input
          type="date"
          value={dateFromFilter}
          onChange={(e) => {
            setDateFromFilter(e.target.value)
            setPage(1)
          }}
          placeholder="From Date"
          className="h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
        <input
          type="date"
          value={dateToFilter}
          onChange={(e) => {
            setDateToFilter(e.target.value)
            setPage(1)
          }}
          placeholder="To Date"
          className="h-9 px-3 text-sm border border-input rounded-md bg-background text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
        {(productFilter || warehouseFilter || shopFilter || directionFilter || dateFromFilter || dateToFilter) && (
          <Button size="sm" variant="ghost" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedTransactions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions?.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-medium">{txn.product.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{getLocationDisplay(txn, "from")}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{getLocationDisplay(txn, "to")}</TableCell>
                  <TableCell>{getDirectionBadge(txn.direction)}</TableCell>
                  <TableCell className="text-right">{txn.quantity}</TableCell>
                  <TableCell className="text-sm">{txn.reason}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(txn.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTransaction(txn)}
                      className="p-0 h-6 w-6"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {transactions && transactions.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, transactions.length)} of{" "}
            {transactions.length} transactions
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

      <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Complete information about this stock transaction</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Product</div>
                      <div className="font-medium">{selectedTransaction.product.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">SKU</div>
                      <div className="font-mono text-sm">{selectedTransaction.product.sku}</div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Direction</div>
                      {getDirectionBadge(selectedTransaction.direction)}
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Quantity</div>
                      <div className="text-2xl font-bold">{selectedTransaction.quantity}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Reason</div>
                    <div className="font-medium">{selectedTransaction.reason}</div>
                  </div>
                  {getLocationDisplay(selectedTransaction, "from") !== "—" && (
                    <div>
                      <div className="text-sm text-muted-foreground">From Location</div>
                      <div className="font-medium">{getLocationDisplay(selectedTransaction, "from")}</div>
                    </div>
                  )}
                  {getLocationDisplay(selectedTransaction, "to") !== "—" && (
                    <div>
                      <div className="text-sm text-muted-foreground">To Location</div>
                      <div className="font-medium">{getLocationDisplay(selectedTransaction, "to")}</div>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <div className="text-sm text-muted-foreground">Timestamp</div>
                    <div className="font-medium">{new Date(selectedTransaction.createdAt).toLocaleString()}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => setSelectedTransaction(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
