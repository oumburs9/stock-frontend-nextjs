"use client"

import { useState } from "react"
import { useBatchesByProduct } from "@/lib/hooks/use-batches"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, DollarSign } from "lucide-react"
import { AddBatchExpenseDialog } from "./add-batch-expense-dialog"
import { useAuth } from "@/lib/hooks/use-auth"
import { formatCurrency } from "@/lib/utils/currency"

interface BatchViewerProps {
  productId: string
}

export function BatchViewer({ productId }: BatchViewerProps) {
  const { data: batches, isLoading } = useBatchesByProduct(productId)
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false)
  const { hasPermission } = useAuth()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!batches || batches.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">No batches found for this product</p>
        </CardContent>
      </Card>
    )
  }

  const handleAddExpense = (batchId: string) => {
    setSelectedBatchId(batchId)
    setIsExpenseDialogOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Batch History</CardTitle>
          <CardDescription>All batches for the selected product with cost tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch ID</TableHead>
                  <TableHead>Shipment ID</TableHead>
                  <TableHead>Received At</TableHead>
                  <TableHead className="text-right">Qty Received</TableHead>
                  <TableHead className="text-right">Qty Remaining</TableHead>
                  <TableHead className="text-right">Base Cost</TableHead>
                  <TableHead className="text-right">Landed Cost</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-mono text-xs">{batch.id?.slice(0, 16) || "N/A"}...</TableCell>
                    <TableCell className="font-mono text-xs">
                      {batch.shipment_id ? `${batch.shipment_id.slice(0, 16)}...` : "PO Only"}
                    </TableCell>
                    <TableCell>{new Date(batch.received_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{batch.quantity_received}</TableCell>
                    <TableCell className="text-right font-mono font-medium">{batch.quantity_remaining}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(Number(batch.base_unit_cost ?? 0), 'ETB')} 
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(Number(batch.landed_unit_cost ?? 0), 'ETB')} 
                    </TableCell>
                    <TableCell>
                      {hasPermission("product-batch-expense:add") && (<Button size="sm" variant="outline" onClick={() => handleAddExpense(batch.id)}>
                        <DollarSign className="h-3 w-3 mr-1" />
                        Add Expense
                      </Button>)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Cost Information</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <strong>Base Cost:</strong> The original unit cost when the batch was received
              </li>
              <li>
                <strong>Landed Cost:</strong> Base cost plus allocated shipment/batch expenses
              </li>
              <li>
                <strong>Quantity Remaining:</strong> Current available quantity (decreases with sales/usage)
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {selectedBatchId && (
        <AddBatchExpenseDialog
          batchId={selectedBatchId}
          open={isExpenseDialogOpen}
          onOpenChange={setIsExpenseDialogOpen}
        />
      )}
    </>
  )
}
