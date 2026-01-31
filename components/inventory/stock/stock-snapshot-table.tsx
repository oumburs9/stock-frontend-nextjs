"use client"

import { useState } from "react"
import { Search, ChevronLeft, ChevronRight, Info, X } from "lucide-react"
import { useStocks } from "@/lib/hooks/use-stocks"
import { useWarehouses } from "@/lib/hooks/use-warehouses"
import { useShops } from "@/lib/hooks/use-shops"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { StockSnapshot } from "@/lib/types/inventory"

export function StockSnapshotTable() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [selectedStock, setSelectedStock] = useState<StockSnapshot | null>(null)
  const [warehouseFilter, setWarehouseFilter] = useState<string>("")
  const [shopFilter, setShopFilter] = useState<string>("")
  const router = useRouter()

  const { data: warehouses } = useWarehouses()
  const { data: shops } = useShops()

  const { data: stocks, isLoading } = useStocks({
    search,
    warehouseId: warehouseFilter,
    shopId: shopFilter,
  })

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedStocks = stocks?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((stocks?.length || 0) / itemsPerPage)

  const clearFilters = () => {
    setWarehouseFilter("")
    setShopFilter("")
    setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by product or SKU..."
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
        {(warehouseFilter || shopFilter) && (
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
              <TableHead>SKU</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">On Hand</TableHead>
              <TableHead className="text-right">Reserved</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedStocks?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No stock found
                </TableCell>
              </TableRow>
            ) : (
              paginatedStocks?.map((stock) => (
                <TableRow key={stock.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{stock.product.name}</TableCell>
                  <TableCell className="text-sm font-mono">{stock.product.sku}</TableCell>
                  <TableCell className="text-sm">{stock.warehouse?.name || stock.shop?.name || "Unknown"}</TableCell>
                  <TableCell className="text-right">{stock.onHand || 0}</TableCell>
                  <TableCell className="text-right text-orange-600">{stock.reserved || 0}</TableCell>
                  <TableCell className="text-right font-medium text-green-600">{stock.available || 0}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedStock(stock)} className="p-0 h-6 w-6">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {stocks && stocks.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, stocks.length)} of {stocks.length} items
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

      <Dialog open={!!selectedStock} onOpenChange={(open) => !open && setSelectedStock(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Stock Details</DialogTitle>
            <DialogDescription>Complete stock information and recent transactions</DialogDescription>
          </DialogHeader>
          {selectedStock && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Product Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Name</div>
                      <div className="font-medium">{selectedStock.product.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">SKU</div>
                      <div className="font-mono text-sm">{selectedStock.product.sku}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Location</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Type</div>
                      <div className="font-medium">{selectedStock.warehouse ? "Warehouse" : "Shop"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Name</div>
                      <div className="font-medium">{selectedStock.warehouse?.name || selectedStock.shop?.name}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Stock Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="text-xs text-muted-foreground">On Hand</div>
                      <div className="text-2xl font-bold">{selectedStock.onHand || 0}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-950">
                      <div className="text-xs text-muted-foreground">Reserved</div>
                      <div className="text-2xl font-bold text-orange-600">{selectedStock.reserved || 0}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-950">
                      <div className="text-xs text-muted-foreground">Available</div>
                      <div className="text-2xl font-bold text-green-600">{selectedStock.available || 0}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Transactions</CardTitle>
                  <CardDescription>Last 10 movements for this product at this location</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedStock.recentTransactions && selectedStock.recentTransactions.length > 0 ? (
                      selectedStock.recentTransactions.slice(0, 10).map((txn) => (
                        <div
                          key={txn.id}
                          className="flex items-center justify-between text-sm border-b pb-2 last:border-0"
                        >
                          <div>
                            <div className="font-medium">{txn.reason || txn.direction}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(txn.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={
                                txn.direction === "in"
                                  ? "text-green-600 font-medium"
                                  : txn.direction === "out"
                                    ? "text-red-600 font-medium"
                                    : "text-blue-600 font-medium"
                              }
                            >
                              {txn.direction === "in" ? "+" : "-"}
                              {txn.quantity}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground py-4 text-center">No recent transactions</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => setSelectedStock(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
