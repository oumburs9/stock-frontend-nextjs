"use client"

import { useState } from "react"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useStocks } from "@/lib/hooks/use-stocks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function StockTable() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const { data: stocks, isLoading } = useStocks({ search })

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedStocks = stocks?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((stocks?.length || 0) / itemsPerPage)
  console.log('LLLLLLL ', paginatedStocks)

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search stocks..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="pl-9"
        />
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedStocks?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No stocks found
                </TableCell>
              </TableRow>
            ) : (
              paginatedStocks?.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell className="font-medium">{stock.product.name}</TableCell>
                  <TableCell className="text-sm">{stock.product.sku}</TableCell>
                  <TableCell className="text-sm">{stock.warehouse?.name || stock.shop?.name || "Unknown"}</TableCell>
                  <TableCell className="text-right">{stock.onHand || 0}</TableCell>
                  <TableCell className="text-right">{stock.reserved || 0}</TableCell>
                  <TableCell className="text-right font-medium">{stock.available || 0}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {stocks && stocks.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, stocks.length)} of {stocks.length} stocks
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
    </div>
  )
}
