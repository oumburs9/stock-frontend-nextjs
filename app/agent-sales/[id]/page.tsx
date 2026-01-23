"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ArrowLeft, CheckCircle, FileText } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useAgentSale } from "@/lib/hooks/use-agent-sales"
import { usePartners } from "@/lib/hooks/use-partners"
import { useProducts } from "@/lib/hooks/use-products"
import { formatCurrency } from "@/lib/utils/currency"
import { ConfirmAgentSaleDialog } from "@/components/agent-sales/confirm-agent-sale-dialog"
import { IssueInvoiceDialog } from "@/components/agent-sales/issue-invoice-dialog"
import { AgentSaleFinanceTab } from "@/components/agent-sales/agent-sale-finance-tab"
import { EditAgentSaleItemsDialog } from "@/components/agent-sales/edit-agent-sale-items-dialog"
import { EditAgentSaleDialog } from "@/components/agent-sales/edit-agent-sale-dialog"
import { RequirePermission } from "@/components/auth/require-permission"
import { useAuth } from "@/lib/hooks/use-auth"

export default function AgentSaleDetailPage() {
  const { id } = useParams<{ id: string }>() 
  const router = useRouter()
  const { toast } = useToast()
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showEditSaleDialog, setShowEditSaleDialog] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showIssueInvoiceDialog, setShowIssueInvoiceDialog] = useState(false)
  const [showEditItemsDialog, setShowEditItemsDialog] = useState(false)

  const { data: sale } = useAgentSale( id )
  const { data: customers = [] } = usePartners("customer")
  const { data: suppliers = [] } = usePartners("supplier")
  const { data: products = [] } = useProducts()
  const { hasPermission } = useAuth()

  const canEdit = sale?.status === "draft"
  const canConfirm = sale?.status === "draft"
  const canIssueInvoice = sale?.status === "confirmed" && !sale?.invoice_id

  const getCustomerName = (id: string) => customers.find((c) => c.id === id)?.name || `Customer ${id.slice(0, 8)}`
  const getPrincipalName = (id: string) => suppliers.find((s) => s.id === id)?.name || `Principal ${id.slice(0, 8)}`
  const getProductName = (id: string) => products.find((p) => p.id === id)?.name || "Unknown Product"
  const getProductSku = (id: string) => products.find((p) => p.id === id)?.sku || "-"

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary"> = {
      draft: "secondary",
      confirmed: "default",
    }
    return <Badge variant={variants[status] || "secondary"}>{status.toUpperCase()}</Badge>
  }

  if (!sale) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <RequirePermission permission="agent-sale:view">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/agent-sales")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Agent Sale: {sale.code}</h1>
                <p className="text-muted-foreground">View and manage agent sale details</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(sale.status)}
              {canEdit && hasPermission("agent-sale:update") && (
                <Button variant="outline" onClick={() => setShowEditSaleDialog(true)}>
                  Edit Sale
                </Button>
              )}
              {canConfirm && hasPermission("agent-sale:confirm") && (
                <Button onClick={() => setShowConfirmDialog(true)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Sale
                </Button>
              )}
              {canIssueInvoice && hasPermission("agent-sale:issue-invoice") && (
                <Button onClick={() => setShowIssueInvoiceDialog(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Issue Invoice
                </Button>
              )}
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Gross Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(Number.parseFloat(sale.gross_total))} {sale.currency}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Commission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(Number.parseFloat(sale.commission_total))} {sale.currency}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Net Principal Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(Number.parseFloat(sale.net_principal_total))} {sale.currency}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* General Information */}
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium">{getCustomerName(sale.customer_id)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Principal:</span>
                  <span className="font-medium">{getPrincipalName(sale.principal_id)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sale Date:</span>
                  <span>{new Date(sale.sale_date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commission Type:</span>
                  <Badge variant="outline">
                    {sale.commission_type === "license_use" ? "License Use" : "Principal Commission"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency:</span>
                  <span className="font-mono">{sale.currency}</span>
                </div>
                {sale.notes && (
                  <div className="pt-2">
                    <span className="text-muted-foreground block mb-1">Notes:</span>
                    <p className="text-sm">{sale.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="items" className="space-y-4">
            <TabsList>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="finance">Finance</TabsTrigger>
            </TabsList>

            <TabsContent value="items" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Sale Items</CardTitle>
                    {canEdit && hasPermission("agent-sale-ite:update") && (
                      <Button size="sm" onClick={() => setShowEditItemsDialog(true)}>
                        Edit Items
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Line Total</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                        <TableHead className="text-right">Net Principal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sale.items && sale.items.length > 0 ? (
                        sale.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{getProductName(item.product_id)}</TableCell>
                            <TableCell className="font-mono text-sm">{getProductSku(item.product_id)}</TableCell>
                            <TableCell className="text-right">{Number.parseFloat(item.quantity).toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(Number.parseFloat(item.gross_unit_price))}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(Number.parseFloat(item.gross_line_total))}
                            </TableCell>
                            <TableCell className="text-right text-orange-600">
                              {formatCurrency(Number.parseFloat(item.commission_amount))}
                            </TableCell>
                            <TableCell className="text-right text-green-600">
                              {formatCurrency(Number.parseFloat(item.net_principal_amount))}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            No items in this sale
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="finance" className="space-y-4">
              <AgentSaleFinanceTab agentSale={sale} />
            </TabsContent>
          </Tabs>

          {canEdit && (
            <EditAgentSaleItemsDialog open={showEditItemsDialog} onOpenChange={setShowEditItemsDialog} agentSale={sale} />
          )}
          {canEdit && (
            <EditAgentSaleDialog open={showEditSaleDialog} onOpenChange={setShowEditSaleDialog} agentSale={sale} />
          )}
          {canConfirm && (
            <ConfirmAgentSaleDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog} agentSale={sale} />
          )}
          {canIssueInvoice && (
            <IssueInvoiceDialog open={showIssueInvoiceDialog} onOpenChange={setShowIssueInvoiceDialog} agentSale={sale} />
          )}
        </div>
      </RequirePermission>
    </DashboardLayout>
  )
}
