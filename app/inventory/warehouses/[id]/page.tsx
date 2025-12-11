"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ArrowLeft, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { warehouseService } from "@/lib/services/warehouse.service"
import { stockService } from "@/lib/services/stock.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function WarehouseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <WarehouseDetailContent id={id} />
}

function WarehouseDetailContent({ id }: { id: string }) {
  const router = useRouter()

  const { data: warehouse, isLoading } = useQuery({
    queryKey: ["warehouses", id],
    queryFn: () => warehouseService.getWarehouse(id),
  })

  const { data: stockData } = useQuery({
    queryKey: ["stocks", "warehouse", id],
    queryFn: () => stockService.getStockByLocation("warehouse", id),
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center text-muted-foreground">Loading...</div>
      </DashboardLayout>
    )
  }

  if (!warehouse) {
    return (
      <DashboardLayout>
        <div className="text-center text-muted-foreground">Warehouse not found</div>
      </DashboardLayout>
    )
  }

  const totalStock = stockData?.reduce((sum, s) => sum + (s.onHand || 0), 0) || 0

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
          <MapPin className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">{warehouse.name}</h1>
            <p className="text-muted-foreground">Warehouse Details</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Warehouse location details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Name</div>
                <div className="text-base font-medium">{warehouse.name}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Address</div>
                <div className="text-base">{warehouse.address || "-"}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Description</div>
                <div className="text-base">{warehouse.description || "-"}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stock Summary</CardTitle>
              <CardDescription>Total inventory at this warehouse</CardDescription>
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
            <CardTitle>Stock at this Warehouse</CardTitle>
            <CardDescription>{stockData?.length || 0} product(s) stored</CardDescription>
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
              <div className="text-center text-muted-foreground py-8">No stock stored at this warehouse</div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
