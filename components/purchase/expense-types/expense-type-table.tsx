"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Search,
  X,
} from "lucide-react"
import type { AxiosError } from "axios"

import { useExpenseTypes, useDeleteExpenseType } from "@/lib/hooks/use-expense-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

import { ExpenseTypeFormDialog } from "./expense-type-form-dialog"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"

import type { ExpenseType } from "@/lib/types/purchase"
import { useAuth } from "@/lib/hooks/use-auth"

import { useToast } from "@/hooks/use-toast"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"

export function ExpenseTypeTable() {
  const [search, setSearch] = useState("")
  const [scopeFilter, setScopeFilter] = useState<"shipment" | "batch" | "">("")
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined)
  const [selectedExpenseType, setSelectedExpenseType] = useState<ExpenseType | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [expenseTypeToDelete, setExpenseTypeToDelete] = useState<ExpenseType | null>(null)
  const [page, setPage] = useState(1)

  const toast = useToast()
  const { hasPermission } = useAuth()

  const { data: expenseTypes, isLoading } = useExpenseTypes({
    q: search || undefined,
    scope: scopeFilter || undefined,
    active: activeFilter,
  })

  const deleteMutation = useDeleteExpenseType()

  const handleEdit = (expenseType: ExpenseType) => {
    setSelectedExpenseType(expenseType)
    setIsDialogOpen(true)
  }

  const handleDelete = (expenseType: ExpenseType) => {
    setExpenseTypeToDelete(expenseType)
  }

  const confirmDelete = () => {
    if (!expenseTypeToDelete) return
    if (!hasPermission("purchase-expense-type:delete")) return

    deleteMutation.mutate(expenseTypeToDelete.id, {
      onSuccess: () => {
        toast.success("Expense type deleted")
        setExpenseTypeToDelete(null)
      },
      onError: (e: AxiosError) =>
        showApiErrorToast(parseApiError(e), toast, "Failed to delete expense type."),
    })
  }

  const hasFilters = scopeFilter || activeFilter !== undefined

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedExpenseTypes = expenseTypes?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((expenseTypes?.length || 0) / itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expense types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {hasPermission("purchase-expense-type:create") && (
          <Button
            onClick={() => {
              setSelectedExpenseType(null)
              setIsDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Expense Type
          </Button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>

        <select
          value={scopeFilter}
          onChange={(e) => setScopeFilter(e.target.value as "shipment" | "batch" | "")}
          className="px-3 py-1 text-sm border border-input rounded-md bg-background text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">All Scopes</option>
          <option value="shipment">Shipment</option>
          <option value="batch">Batch</option>
        </select>

        <select
          value={activeFilter === undefined ? "" : activeFilter ? "true" : "false"}
          onChange={(e) =>
            setActiveFilter(
              e.target.value === "" ? undefined : e.target.value === "true",
            )
          }
          className="px-3 py-1 text-sm border border-input rounded-md bg-background text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        {hasFilters && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setScopeFilter("")
              setActiveFilter(undefined)
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
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Capitalizable</TableHead>
              <TableHead>Allocation Method</TableHead>
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
            ) : paginatedExpenseTypes?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No expense types found
                </TableCell>
              </TableRow>
            ) : (
              paginatedExpenseTypes?.map((expenseType) => (
                <TableRow key={expenseType.id}>
                  <TableCell className="font-mono text-sm">
                    {expenseType.code}
                  </TableCell>
                  <TableCell className="font-medium">
                    {expenseType.name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        expenseType.scope === "shipment" ? "default" : "secondary"
                      }
                    >
                      {expenseType.scope}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={expenseType.is_active ? "default" : "secondary"}
                    >
                      {expenseType.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {expenseType.capitalizable ? "Yes" : "No"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {expenseType.default_allocation_method || "-"}
                  </TableCell>
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
                        {hasPermission("purchase-expense-type:update") && (
                          <DropdownMenuItem
                            onClick={() => handleEdit(expenseType)}
                          >
                            Edit
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {hasPermission("purchase-expense-type:delete") && (
                          <DropdownMenuItem
                            onClick={() => handleDelete(expenseType)}
                            className="text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {expenseTypes && expenseTypes.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, expenseTypes.length)} of{" "}
            {expenseTypes.length} transfers
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
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

      <ExpenseTypeFormDialog
        expenseType={selectedExpenseType}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      <ConfirmDeleteDialog
        open={!!expenseTypeToDelete}
        onOpenChange={(open) => !open && setExpenseTypeToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Expense Type"
        description="Are you sure you want to delete this expense type? This action cannot be undone."
        itemName={expenseTypeToDelete?.name}
      />
    </div>
  )
}
