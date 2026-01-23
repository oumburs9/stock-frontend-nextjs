"use client"

import { useState } from "react"
import { MoreHorizontal, Plus, Search, Eye, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useProducts, useDeleteProduct } from "@/lib/hooks/use-products"
import { useCategories } from "@/lib/hooks/use-categories"
import { useBrands } from "@/lib/hooks/use-brands"
import { useUnits } from "@/lib/hooks/use-units"
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
import { ProductFormDialog } from "./product-form-dialog"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { useRouter } from "next/navigation"
import type { Product } from "@/lib/types/master-data"
import { useAuth } from "@/lib/hooks/use-auth"

export function ProductTable() {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [brandFilter, setBrandFilter] = useState("")
  const [unitFilter, setUnitFilter] = useState("")
  const [page, setPage] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const router = useRouter()

  const { hasPermission } =  useAuth()
  const { data: products, isLoading } = useProducts({
    search,
    category_id: categoryFilter,
    brand_id: brandFilter,
    unit_id: unitFilter,
  })
  const { data: categories } = useCategories()
  const { data: brands } = useBrands()
  const { data: units } = useUnits()
  const deleteMutation = useDeleteProduct()

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setIsDialogOpen(true)
  }

  const handleDelete = (product: Product) => {
    setProductToDelete(product)
  }

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id)
    }
  }

  const handleViewDetails = (id: string) => {
    router.push(`/master-data/products/${id}`)
  }

  const selectedCategory = categories?.find((c) => c.id === categoryFilter)
  const selectedBrand = brands?.find((b) => b.id === brandFilter)
  const selectedUnit = units?.find((u) => u.id === unitFilter)

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedProducts = products?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((products?.length || 0) / itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {hasPermission("product:create") && (
          <Button
            onClick={() => {
              setSelectedProduct(null)
              setIsDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>)}
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value)
            setPage(1)
          }}
          className="px-3 py-1 text-sm border border-input rounded-md bg-background text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">All Categories</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={brandFilter}
          onChange={(e) => {
            setBrandFilter(e.target.value)
            setPage(1)
          }}
          className="px-3 py-1 text-sm border border-input rounded-md bg-background text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">All Brands</option>
          {brands?.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
        <select
          value={unitFilter}
          onChange={(e) => {
            setUnitFilter(e.target.value)
            setPage(1)
          }}
          className="px-3 py-1 text-sm border border-input rounded-md bg-background text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">All Units</option>
          {units?.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </select>
        {(categoryFilter || brandFilter || unitFilter) && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setCategoryFilter("")
              setBrandFilter("")
              setUnitFilter("")
              setPage(1)
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
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Base Price</TableHead>
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
            ) : paginatedProducts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts?.map((product: any) => (
                
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product?.category.name || "-"}</TableCell>
                  <TableCell>{product.brand?.name|| "-"}</TableCell>
                  <TableCell>{product.unit?.name || "-"}</TableCell>
                  <TableCell className="text-right font-mono">{ product.base_price ? `ETB ${Number(product.base_price).toFixed(2)}` : "0.00"}</TableCell>
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
                        {hasPermission("product:view") && (<DropdownMenuItem onClick={() => handleViewDetails(product.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>)}
                        {hasPermission("product:update") && (<DropdownMenuItem onClick={() => handleEdit(product)}>Edit</DropdownMenuItem>)}
                        <DropdownMenuSeparator />
                        {hasPermission("product:delete") && (<DropdownMenuItem onClick={() => handleDelete(product)} className="text-destructive">
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

      {products && products.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, products.length)} of {products.length}{" "}
            products
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

      <ProductFormDialog product={selectedProduct} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <ConfirmDeleteDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        itemName={`${productToDelete?.name} (${productToDelete?.sku})`}
      />
    </div>
  )
}
