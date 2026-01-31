"use client"

import { useState } from "react"
import { MoreHorizontal, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useShops, useDeleteShop } from "@/lib/hooks/use-shops"
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
import { ShopFormDialog } from "./shop-form-dialog"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import type { Shop } from "@/lib/types/inventory"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import type { AxiosError } from "axios"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"
import { useToast } from "@/hooks/use-toast"

export function ShopTable() {
  const [search, setSearch] = useState("")
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [shopToDelete, setShopToDelete] = useState<Shop | null>(null)
  const [page, setPage] = useState(1)

  const router = useRouter()
  const toast = useToast()
  const { hasPermission } = useAuth()
  const { data: shops, isLoading } = useShops()
  const deleteMutation = useDeleteShop()

  const filteredShops = shops?.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase()),
  )

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedShops = filteredShops?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((filteredShops?.length || 0) / itemsPerPage)

  const handleEdit = (shop: Shop) => {
    setSelectedShop(shop)
    setIsDialogOpen(true)
  }

  const handleDelete = (shop: Shop) => {
    setShopToDelete(shop)
  }

  const confirmDelete = () => {
    if (!shopToDelete) return

    deleteMutation.mutate(shopToDelete.id, {
      onSuccess: () => {
        toast.success("Shop deleted", "The shop was deleted successfully.")
        setShopToDelete(null)
      },
      onError: (e: AxiosError) =>
        showApiErrorToast(parseApiError(e), toast, "Failed to delete shop."),
    })
  }

  const handleViewDetails = (shopId: string) => {
    router.push(`/inventory/shops/${shopId}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shops..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        {hasPermission("shop:create") && (
          <Button
            onClick={() => {
              setSelectedShop(null)
              setIsDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Shop
          </Button>
        )}
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
            ) : paginatedShops?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No shops found
                </TableCell>
              </TableRow>
            ) : (
              paginatedShops?.map((shop) => (
                <TableRow
                  key={shop.id}
                  onClick={() => handleViewDetails(shop.id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{shop.name}</TableCell>
                  <TableCell>{shop.address}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{shop.description}</TableCell>
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
                        {hasPermission("shop:update") && (
                          <DropdownMenuItem onClick={() => handleEdit(shop)}>
                            Edit
                          </DropdownMenuItem>
                        )}
                        {hasPermission("shop:view") && (
                          <DropdownMenuItem onClick={() => handleViewDetails(shop.id)}>
                            View Details
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {hasPermission("shop:delete") && (
                          <DropdownMenuItem
                            onClick={() => handleDelete(shop)}
                            className="text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
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

      {filteredShops && filteredShops.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, filteredShops.length)} of{" "}
            {filteredShops.length} shops
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
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

      <ShopFormDialog shop={selectedShop} open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      <ConfirmDeleteDialog
        open={!!shopToDelete}
        onOpenChange={(open) => !open && setShopToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Shop"
        description="Are you sure you want to delete this shop? This action cannot be undone."
        itemName={shopToDelete?.name}
      />
    </div>
  )
}
