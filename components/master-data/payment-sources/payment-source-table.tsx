"use client"

import { useState } from "react"
import { MoreHorizontal, Plus, Search, Pencil, Trash2 } from "lucide-react"
import { usePaymentSources, useDeletePaymentSource } from "@/lib/hooks/use-payment-sources"
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
import { Badge } from "@/components/ui/badge"
import { PaymentSourceFormDialog } from "./payment-source-form-dialog"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import type { PaymentSource } from "@/lib/types/payment-source"

export function PaymentSourceTable() {
  const [search, setSearch] = useState("")
  const [selectedSource, setSelectedSource] = useState<PaymentSource | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sourceToDelete, setSourceToDelete] = useState<PaymentSource | null>(null)

  const { data: sources, isLoading } = usePaymentSources()
  const deleteMutation = useDeletePaymentSource()

  const filteredSources = sources?.filter(
    (source) =>
      source.name.toLowerCase().includes(search.toLowerCase()) ||
      source.type.toLowerCase().includes(search.toLowerCase()),
  )

  const handleEdit = (source: PaymentSource) => {
    setSelectedSource(source)
    setIsDialogOpen(true)
  }

  const handleDelete = (source: PaymentSource) => {
    setSourceToDelete(source)
  }

  const confirmDelete = () => {
    if (sourceToDelete) {
      deleteMutation.mutate(sourceToDelete.id)
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "bank_account":
        return "Bank Account"
      case "cash_register":
        return "Cash Register"
      case "mobile_wallet":
        return "Mobile Wallet"
      default:
        return type
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payment sources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => {
            setSelectedSource(null)
            setIsDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Source
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Account Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredSources?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No payment sources found
                </TableCell>
              </TableRow>
            ) : (
              filteredSources?.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell>{getTypeLabel(source.type)}</TableCell>
                  <TableCell>{source.account_number || "—"}</TableCell>
                  <TableCell>
                    {source.is_active ? (
                      <Badge variant="default" className="bg-green-500">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>{new Date(source.updated_at).toLocaleDateString()}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleEdit(source)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(source)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PaymentSourceFormDialog paymentSource={selectedSource} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <ConfirmDeleteDialog
        open={!!sourceToDelete}
        onOpenChange={(open) => !open && setSourceToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Payment Source"
        description="Are you sure you want to delete this payment source? This action cannot be undone if the source is not referenced by any payments."
        itemName={sourceToDelete?.name}
      />
    </div>
  )
}
