"use client"

import { useState } from "react"
import { MoreHorizontal, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useAttributes, useDeleteAttribute } from "@/lib/hooks/use-attributes"
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
import { AttributeFormDialog } from "./attribute-form-dialog"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import type { Attribute } from "@/lib/types/master-data"
import { Badge } from "@/components/ui/badge"

export function AttributeTable() {
  const [search, setSearch] = useState("")
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [attributeToDelete, setAttributeToDelete] = useState<Attribute | null>(null)
  const [page, setPage] = useState(1)

  const { data: attributes, isLoading } = useAttributes()
  const deleteMutation = useDeleteAttribute()

  const filteredAttributes = attributes?.filter(
    (attribute) =>
      attribute.name.toLowerCase().includes(search.toLowerCase()) ||
      attribute.label.toLowerCase().includes(search.toLowerCase()),
  )

  const handleEdit = (attribute: Attribute) => {
    setSelectedAttribute(attribute)
    setIsDialogOpen(true)
  }

  const handleDelete = (attribute: Attribute) => {
    setAttributeToDelete(attribute)
  }

  const confirmDelete = () => {
    if (attributeToDelete) {
      deleteMutation.mutate(attributeToDelete.id)
    }
  }

  const itemsPerPage = 10
  const startIndex = (page - 1) * itemsPerPage
  const paginatedAttributes = filteredAttributes?.slice(startIndex, startIndex + itemsPerPage)
  const totalPages = Math.ceil((filteredAttributes?.length || 0) / itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search attributes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => {
            setSelectedAttribute(null)
            setIsDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Attribute
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Data Type</TableHead>
              <TableHead>Required</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedAttributes?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No attributes found
                </TableCell>
              </TableRow>
            ) : (
              paginatedAttributes?.map((attribute) => (
                <TableRow key={attribute.id}>
                  <TableCell className="font-mono text-sm">{attribute.name}</TableCell>
                  <TableCell className="font-medium">{attribute.label}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{attribute.data_type}</Badge>
                  </TableCell>
                  <TableCell>{attribute.is_required ? "Yes" : "No"}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleEdit(attribute)}>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(attribute)} className="text-destructive">
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

      {filteredAttributes && filteredAttributes.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAttributes.length)} of{" "}
            {filteredAttributes.length} attributes
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

      <AttributeFormDialog attribute={selectedAttribute} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <ConfirmDeleteDialog
        open={!!attributeToDelete}
        onOpenChange={(open) => !open && setAttributeToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Attribute"
        description="Are you sure you want to delete this attribute? This action cannot be undone."
        itemName={attributeToDelete?.label}
      />
    </div>
  )
}
