"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ArrowLeft, Tag } from "lucide-react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { brandService } from "@/lib/services/brand.service"
import { productService } from "@/lib/services/product.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RequirePermission } from "@/components/auth/require-permission"

export default async function BrandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return <BrandDetailContent id={id} />
}

function BrandDetailContent({ id }: { id: string }) {
  const router = useRouter()

  const { data: brand, isLoading } = useQuery({
    queryKey: ["brands", id],
    queryFn: () => brandService.getBrand(id),
  })

  const { data: productsData } = useQuery({
    queryKey: ["products", "brand", id],
    queryFn: () => productService.getProducts({ limit: 1000 }),
    select: (data) => data.items.filter((p) => p.brand_id === id),
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center text-muted-foreground">Loading...</div>
      </DashboardLayout>
    )
  }

  if (!brand) {
    return (
      <DashboardLayout>
        <div className="text-center text-muted-foreground">Brand not found</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <RequirePermission permission="brand:view">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Tag className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">{brand.name}</h1>
              <p className="text-muted-foreground">Brand Details</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Brand metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Name</div>
                <div className="text-base">{brand.name}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products under this Brand</CardTitle>
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
                        <TableHead>Category</TableHead>
                        <TableHead>Base Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsData.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category_id || "-"}</TableCell>
                          <TableCell>${product.base_price?.toFixed(2) || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">No products under this brand</div>
              )}
            </CardContent>
          </Card>
        </div>
      </RequirePermission>
    </DashboardLayout>
  )
}
