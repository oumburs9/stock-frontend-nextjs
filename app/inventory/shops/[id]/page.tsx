"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ArrowLeft, Store } from "lucide-react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { shopService } from "@/lib/services/shop.service"
import { stockService } from "@/lib/services/stock.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RequirePermission } from "@/components/auth/require-permission"

export default async function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ShopDetailContent id={id} />
}

function ShopDetailContent({ id }: { id: string }) {
  const router = useRouter()

  const { data: shop, isLoading } = useQuery({
    queryKey: ["shops", id],
    queryFn: () => shopService.getShop(id),
  })

  const { data: stockData } = useQuery({
    queryKey: ["stocks", "shop", id],
    queryFn: () => stockService.getStockByLocation("shop", id),
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center text-muted-foreground">Loading...</div>
      </DashboardLayout>
    )
  }

  if (!shop) {
    return (
      <DashboardLayout>
        <div className="text-center text-muted-foreground">Shop not found</div>
      </DashboardLayout>
    )
  }

  const totalStock = stockData?.reduce((sum, s) => sum + (s.onHand || 0), 0) || 0

  return (
    <DashboardLayout>
      <RequirePermission permission="shop:view">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Store className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">{shop.name}</h1>
              <p className="text-muted-foreground">Shop Details</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Shop location details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Name</div>
                  <div className="text-base font-medium">{shop.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Address</div>
                  <div className="text-base">{shop.address || "-"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Description</div>
                  <div className="text-base">{shop.description || "-"}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Summary</CardTitle>
                <CardDescription>Total inventory at this shop</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Total Products</span>
                    <Badge variant="secondary">{stockData?.length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Total On Hand</span>
                    <span className="text-2xl font-bold">{totalStock}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stock at this Shop</CardTitle>
              <CardDescription>{stockData?.length || 0} product(s) in inventory</CardDescription>
            </CardHeader>
            <CardContent>
              {stockData && stockData.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">On Hand</TableHead>
                        <TableHead className="text-right">Reserved</TableHead>
                        <TableHead className="text-right">Available</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockData.map((stock) => (
                        <TableRow key={stock.id}>
                          <TableCell className="font-medium">{stock.product.name}</TableCell>
                          <TableCell className="font-mono text-sm">{stock.product.sku}</TableCell>
                          <TableCell className="text-right">{stock.onHand || 0}</TableCell>
                          <TableCell className="text-right text-orange-600">{stock.reserved || 0}</TableCell>
                          <TableCell className="text-right font-medium text-green-600">{stock.available || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">No stock stored at this shop</div>
              )}
            </CardContent>
          </Card>
        </div>
      </RequirePermission>
    </DashboardLayout>
  )
}
