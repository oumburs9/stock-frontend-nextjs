"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ArrowLeft, Package, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { productService } from "@/lib/services/product.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RequirePermission } from "@/components/auth/require-permission"
import { useAuth } from "@/lib/hooks/use-auth"

export function ProductDetailContent({ id }: { id: string }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("general")

  const { hasPermission } = useAuth()
  const { data: product, isLoading } = useQuery({
    queryKey: ["products", id, "full"],
    queryFn: () => productService.getProductFull(id),
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center text-muted-foreground">Loading...</div>
      </DashboardLayout>
    )
  }

  if (!product) {
    return (
      <DashboardLayout>
        <div className="text-center text-muted-foreground">Product not found</div>
      </DashboardLayout>
    )
  }
  console.log("product ll",product)

  return (
    <DashboardLayout>
      <RequirePermission permission="product:view">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            {hasPermission("product-attribute:value:update") && (
              <Button variant="outline" onClick={() => router.push(`/master-data/products/${id}/attributes`)}>
                <Settings className="h-4 w-4 mr-2" />
                Manage Attribute Values
              </Button>)}
          </div>

          <div className="flex items-center gap-3">
            <Package className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground font-mono text-sm">{product.sku}</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="general">General Info</TabsTrigger>
              {hasPermission("product-attribute:value:view") && (
                <TabsTrigger value="attributes">Attributes</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Information</CardTitle>
                    <CardDescription>Basic product details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">SKU</div>
                      <div className="text-base font-mono">{product.sku}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Name</div>
                      <div className="text-base">{product.name}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Description</div>
                      <div className="text-base">{product.description || "-"}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Classification</CardTitle>
                    <CardDescription>Category, brand, and unit information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Category</div>
                      <div className="text-base">{product.category?.name || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Brand</div>
                      <div className="text-base">{product.brand?.name || "-"}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Unit</div>
                      <div className="text-base">
                        {product.unit ? `${product.unit.name} (${product.unit.abbreviation})` : "-"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                  <CardDescription>Base price information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Base Price</div>
                    <div className="text-2xl font-bold">{product.base_price ? `$${Number(product.base_price).toFixed(2)}` : "0.00"}</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attributes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Attributes</CardTitle>
                  <CardDescription>
                    {product.attributes?.length || 0} attribute(s) assigned to this product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {product.attributes && product.attributes.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Attribute</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {product.attributes.map((attr) => (
                            <TableRow key={attr.id}>
                              <TableCell className="font-medium">{attr.attribute?.label}</TableCell>
                              <TableCell>
                                <span className="px-2 py-1 bg-muted rounded text-xs">{attr.attribute?.data_type}</span>
                              </TableCell>
                              <TableCell>
                                {attr.value_text ||
                                  attr.value_number ||
                                  attr.value_date ||
                                  (attr.value_bool !== null ? (attr.value_bool ? "Yes" : "No") : "-")}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">No attributes assigned to this product</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </RequirePermission>
    </DashboardLayout>
  )
}