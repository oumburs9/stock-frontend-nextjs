"use client"

import { useState } from "react"
import { MoreHorizontal, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useWarehouses, useDeleteWarehouse } from "@/lib/hooks/use-warehouses"
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
import { WarehouseFormDialog } from "./warehouse-form-dialog"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import type { Warehouse } from "@/lib/types/inventory"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"

export function WarehouseTable() {
  const [search, setSearch] = useState("")
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(null)
  const [page, setPage] = useState(1)
  const router = useRouter()

  const { hasPermission } = useAuth()
  const { data: warehouses, isLoading } = useWarehouses()
  const deleteMutation = useDeleteWarehouse()

  const filteredWarehouses = warehouses?.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) || w.address.toLowerCase().includes(search.toLowerCase()),
  )

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedWarehouses = filteredWarehouses?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((filteredWarehouses?.length || 0) / itemsPerPage)

  const handleEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse)
    setIsDialogOpen(true)
  }

  const handleDelete = (warehouse: Warehouse) => {
    setWarehouseToDelete(warehouse)
  }

  const confirmDelete = () => {
    if (warehouseToDelete) {
      deleteMutation.mutate(warehouseToDelete.id)
    }
  }

  const handleViewDetails = (warehouseId: string) => {
    setSelectedWarehouse(warehouses?.find((w) => w.id === warehouseId) || null)
    // Navigate to detail page
    router.push(`/inventory/warehouses/${warehouseId}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search warehouses..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        {hasPermission("warehouse:create") && (
          <Button
            onClick={() => {
              setSelectedWarehouse(null)
              setIsDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Warehouse
          </Button>)}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedWarehouses?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No warehouses found
                </TableCell>
              </TableRow>
            ) : (
              paginatedWarehouses?.map((warehouse) => (
                <TableRow
                  key={warehouse.id}
                  onClick={() => handleViewDetails(warehouse.id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{warehouse.name}</TableCell>
                  <TableCell>{warehouse.address}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{warehouse.description}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {hasPermission("warehouse:update") && (<DropdownMenuItem onClick={() => handleEdit(warehouse)}>Edit</DropdownMenuItem>)}
                        {hasPermission("warehouse:view") && (<DropdownMenuItem onClick={() => handleViewDetails(warehouse.id)}>
                          View Details
                        </DropdownMenuItem>)}
                        <DropdownMenuSeparator />
                        {hasPermission("warehouse:delete") && (<DropdownMenuItem onClick={() => handleDelete(warehouse)} className="text-destructive">
                          Delete
                        </DropdownMenuItem>)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredWarehouses && filteredWarehouses.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredWarehouses.length)} of{" "}
            {filteredWarehouses.length} warehouses
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

      <WarehouseFormDialog warehouse={selectedWarehouse} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <ConfirmDeleteDialog
        open={!!warehouseToDelete}
        onOpenChange={(open) => !open && setWarehouseToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Warehouse"
        description="Are you sure you want to delete this warehouse? This action cannot be undone."
        itemName={warehouseToDelete?.name}
      />
    </div>
  )
}
