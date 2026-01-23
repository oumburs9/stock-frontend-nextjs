"use client"

import { useState } from "react"
import { MoreHorizontal, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useUnits, useDeleteUnit } from "@/lib/hooks/use-units"
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
import { UnitFormDialog } from "./unit-form-dialog"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import type { Unit } from "@/lib/types/master-data"
import { useAuth } from "@/lib/hooks/use-auth"

export function UnitTable() {
  const [search, setSearch] = useState("")
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null)
  const [page, setPage] = useState(1)

  const { hasPermission } = useAuth()
  const { data: units, isLoading } = useUnits()
  const deleteMutation = useDeleteUnit()

  const filteredUnits = units?.filter(
    (unit) =>
      unit.name.toLowerCase().includes(search.toLowerCase()) ||
      unit.abbreviation.toLowerCase().includes(search.toLowerCase()),
  )

  const handleEdit = (unit: Unit) => {
    setSelectedUnit(unit)
    setIsDialogOpen(true)
  }

  const handleDelete = (unit: Unit) => {
    setUnitToDelete(unit)
  }

  const confirmDelete = () => {
    if (unitToDelete) {
      deleteMutation.mutate(unitToDelete.id)
    }
  }

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedUnits = filteredUnits?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((filteredUnits?.length || 0) / itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search units..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        {hasPermission("unit:create") && (
          <Button
            onClick={() => {
              setSelectedUnit(null)
              setIsDialogOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Unit
          </Button>)}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Symbol</TableHead>
              {/* <TableHead>Description</TableHead> */}
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedUnits?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No units found
                </TableCell>
              </TableRow>
            ) : (
              paginatedUnits?.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell className="font-medium">{unit.name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-muted rounded text-sm font-mono">{unit.abbreviation}</span>
                  </TableCell>
                  {/* <TableCell className="text-muted-foreground">{unit.description || "-"}</TableCell> */}
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
                       {hasPermission("unit:update") && ( <DropdownMenuItem onClick={() => handleEdit(unit)}>Edit</DropdownMenuItem>)}
                        <DropdownMenuSeparator />
                        {hasPermission("unit:delete") && (<DropdownMenuItem onClick={() => handleDelete(unit)} className="text-destructive">
                          Delete
                        </DropdownMenuItem>)}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredUnits && filteredUnits.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUnits.length)} of{" "}
            {filteredUnits.length} units
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
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

      <UnitFormDialog unit={selectedUnit} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <ConfirmDeleteDialog
        open={!!unitToDelete}
        onOpenChange={(open) => !open && setUnitToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Unit"
        description="Are you sure you want to delete this unit? This action cannot be undone."
        itemName={`${unitToDelete?.name} (${unitToDelete?.abbreviation})`}
      />
    </div>
  )
}
