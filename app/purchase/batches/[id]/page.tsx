"use client"

import { useState } from "react"
import { useGetBatch } from "@/lib/hooks/use-batches"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Package, DollarSign, Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { AddBatchExpenseDialog } from "@/components/purchase/batches/add-batch-expense-dialog"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AdjustBatchExpenseDialog } from "@/components/purchase/batches/adjust-batch-expense-dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { useProducts } from "@/lib/hooks/use-products"
import { RequirePermission } from "@/components/auth/require-permission"
import { useAuth } from "@/lib/hooks/use-auth"

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [selectedExpenseForAdjust, setSelectedExpenseForAdjust] = useState(null)

  const { hasPermission } = useAuth()
  const { data: batch } = useGetBatch(id)
   const { data: productsData = []} = useProducts()

  const getProductName = (productId: string) => {
    const product = productsData.find((p) => p.id === productId)
    return product?.name || "Unknown Product"
  }

  const displayBatch = batch

  // const totalExpenses = displayBatch?.expenses?.reduce((sum, exp) => sum + Number.parseFloat(exp.amount || "0"), 0) || 0
  const totalExpenses = displayBatch?.expenses.reduce((sum, exp) => {
                            const adjSum = exp.adjustments?.reduce((s, adj) => s + Number.parseFloat(adj.amount), 0) || 0
                            return sum + Number.parseFloat(exp.amount) + adjSum
                          }, 0) || 0

  const hasRemainingQuantity = Number.parseFloat(displayBatch?.quantity_remaining) > 0

  return (
    <DashboardLayout>
      <RequirePermission permission="product-batch:view">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Batch Details</h2>
                <p className="text-muted-foreground">View batch information and expenses</p>
              </div>
            </div>
            {hasPermission("product-batch-expense:add") && (
            <Button onClick={() => setAddExpenseOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>)}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quantity Received</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Number.parseFloat(displayBatch?.quantity_received).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Number.parseFloat(displayBatch?.quantity_remaining).toLocaleString()} remaining
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Base Cost</CardTitle>
                {/* <DollarSign className="h-4 w-4 text-muted-foreground" /> */}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">ETB {Number.parseFloat(displayBatch?.base_unit_cost).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">per unit</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Landed Cost</CardTitle>
                {/* <DollarSign className="h-4 w-4 text-muted-foreground" /> */}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">ETB {Number.parseFloat(displayBatch?.landed_unit_cost).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">includes expenses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                {/* <DollarSign className="h-4 w-4 text-muted-foreground" /> */}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">ETB {totalExpenses.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">{displayBatch?.expenses?.length || 0} expense(s)</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Batch Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Product</span>
                  <span className="text-sm">{ getProductName(displayBatch?.product_id) }</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Source</span>
                  <span className="text-sm">
                    {displayBatch?.shipment_code
                      ? `Shipment: ${displayBatch?.shipment_code}`
                      : displayBatch?.purchase_order_code
                        ? `PO: ${displayBatch?.purchase_order_code}`
                        : "Direct"}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Received Date</span>
                  <span className="text-sm">{new Date(displayBatch?.received_at).toLocaleDateString()}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={Number.parseFloat(displayBatch?.quantity_remaining) > 0 ? "default" : "secondary"}>
                    {Number.parseFloat(displayBatch?.quantity_remaining) > 0 ? "Available" : "Depleted"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Batch Expenses & Adjustments</CardTitle>
              </CardHeader>
              <CardContent>
                {!displayBatch?.expenses || displayBatch?.expenses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No expenses added yet</p>
                    <Button 
                      variant="link" 
                      onClick={() => setAddExpenseOpen(true)} 
                      disabled={!hasPermission("product-batch-expense:add")}
                      className="mt-2"
                      >
                      Add your first expense
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {displayBatch?.expenses.map((expense) => {
                      const adjustmentsSum =
                        expense.adjustments?.reduce((sum, adj) => sum + Number.parseFloat(adj.amount), 0) || 0
                      const netAmount = Number.parseFloat(expense.amount) + adjustmentsSum

                      return (
                        <div key={expense.id} className="space-y-3">
                          <div className="flex items-start justify-between p-4 rounded-lg border bg-muted/50">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="uppercase">
                                  {expense.type}
                                </Badge>
                                <span className="font-medium">{expense.description || "No description"}</span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Date: {new Date(expense.expense_date).toLocaleDateString()}</span>
                                <span>Original: ETB {Number.parseFloat(expense.amount).toFixed(2)}</span>
                                {adjustmentsSum !== 0 && (
                                  <span
                                    className={
                                      adjustmentsSum > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"
                                    }
                                  >
                                    Adjustments: {adjustmentsSum > 0 ? "+" : ""}ETB {adjustmentsSum.toFixed(2)}
                                  </span>
                                )}
                                <span className="font-semibold text-foreground">Net: ETB {netAmount.toFixed(2)}</span>
                              </div>
                            </div>
                            {hasPermission("product-batch-expense:adjust") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedExpenseForAdjust(expense)}
                                disabled={!hasRemainingQuantity}
                                title={hasRemainingQuantity ? "Add adjustment to this expense" : "Batch fully consumed"}
                              >
                                Adjust
                              </Button>)}
                          </div>

                          {expense.adjustments && expense.adjustments.length > 0 && (
                            <Collapsible>
                              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                <ChevronDown className="h-4 w-4" />
                                Adjustments History ({expense.adjustments.length})
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="ml-6 mt-2 space-y-2">
                                  {expense.adjustments.map((adjustment) => (
                                    <div
                                      key={adjustment.id}
                                      className="flex items-center justify-between p-3 rounded-md border border-dashed"
                                    >
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <Badge
                                            variant={Number.parseFloat(adjustment.amount) > 0 ? "default" : "destructive"}
                                            className="text-xs"
                                          >
                                            {Number.parseFloat(adjustment.amount) > 0 ? "+" : ""}ETB
                                            {Number.parseFloat(adjustment.amount).toFixed(2)}
                                          </Badge>
                                          {adjustment.reason && (
                                            <span className="text-sm text-muted-foreground">{adjustment.reason}</span>
                                          )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {new Date(adjustment.created_at).toLocaleString()} • by{" "}
                                          {adjustment.created_by || "System"}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </div>
                      )
                    })}

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between text-lg font-semibold">
                        <span>Total Expenses (with adjustments):</span>
                        <span className="font-bold text-xl">
                          ETB {totalExpenses.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <AddBatchExpenseDialog batchId={id} open={addExpenseOpen} onOpenChange={setAddExpenseOpen} />

          {selectedExpenseForAdjust && (
            <AdjustBatchExpenseDialog
              expense={selectedExpenseForAdjust}
              hasRemainingQuantity={hasRemainingQuantity}
              open={!!selectedExpenseForAdjust}
              onOpenChange={(open) => !open && setSelectedExpenseForAdjust(null)}
            />
          )}
        </div>
      </RequirePermission>
    </DashboardLayout>
  )
}
