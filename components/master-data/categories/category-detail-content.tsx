"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ArrowLeft, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { categoryService } from "@/lib/services/category.service"
import { productService } from "@/lib/services/product.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"


export function CategoryDetailContent({ id }: { id: string }) {
  const router = useRouter()

  const { data: category, isLoading } = useQuery({
    queryKey: ["categories", id],
    queryFn: () => categoryService.getCategory(id),
  })

  const { data: productsData } = useQuery({
    queryKey: ["products", "category", id],
    queryFn: () => productService.getProducts({ limit: 1000 }),
    select: (data) => data.items?.filter((p) => p.category_id === id),
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center text-muted-foreground">Loading...</div>
      </DashboardLayout>
    )
  }

  if (!category) {
    return (
      <DashboardLayout>
        <div className="text-center text-muted-foreground">Category not found</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Package className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            <p className="text-muted-foreground">Category Details</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Category metadata and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Name</div>
                <div className="text-base">{category.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Parent Category</div>
                <div className="text-base">{category.parent_id ? "Sub-category" : "Root Category"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Attribute Set</div>
                <div className="text-base">{category.attribute_set_id ? "Assigned" : "Not assigned"}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Products in this Category</CardTitle>
            <CardDescription>{productsData?.length || 0} product(s)</CardDescription>
          </CardHeader>
          <CardContent>
            {productsData && productsData.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Base Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productsData.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.brand_id || "-"}</TableCell>
                        <TableCell>{product.base_price ? `$${Number(product.base_price).toFixed(2)}`: "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">No products in this category</div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}