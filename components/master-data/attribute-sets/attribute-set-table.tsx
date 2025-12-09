"use client"

import { useState } from "react"
import { MoreHorizontal, Plus, Search, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAttributeSets, useDeleteAttributeSet } from "@/lib/hooks/use-attribute-sets"
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
import { AttributeSetFormDialog } from "./attribute-set-form-dialog"
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import type { AttributeSet } from "@/lib/types/master-data"

export function AttributeSetTable() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [selectedSet, setSelectedSet] = useState<AttributeSet | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [setToDelete, setSetToDelete] = useState<AttributeSet | null>(null)

  const { data: sets, isLoading } = useAttributeSets()
  const deleteMutation = useDeleteAttributeSet()

  const filteredSets = sets?.filter((set) => set.name.toLowerCase().includes(search.toLowerCase()))

  const handleEdit = (set: AttributeSet) => {
    setSelectedSet(set)
    setIsDialogOpen(true)
  }

  const handleDelete = (set: AttributeSet) => {
    setSetToDelete(set)
  }

  const confirmDelete = () => {
    if (setToDelete) {
      deleteMutation.mutate(setToDelete.id)
      setSetToDelete(null)
    }
  }

  const handleManageAttributes = (id: string) => {
    router.push(`/master-data/attribute-sets/${id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search attribute sets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => {
            setSelectedSet(null)
            setIsDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Attribute Set
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Attributes</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredSets?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No attribute sets found
                </TableCell>
              </TableRow>
            ) : (
              filteredSets?.map((set) => (
                <TableRow key={set.id}>
                  <TableCell className="font-medium">{set.name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-muted rounded text-xs">{set.items?.length || 0} attribute(s)</span>
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
                        <DropdownMenuItem onClick={() => handleManageAttributes(set.id)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Manage Attributes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(set)}>Edit Name</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(set)} className="text-destructive">
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

      <AttributeSetFormDialog set={selectedSet} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <ConfirmDeleteDialog
        open={!!setToDelete}
        onOpenChange={(open) => !open && setSetToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Attribute Set"
        description="Are you sure you want to delete this attribute set? This will affect all categories using it."
        itemName={setToDelete?.name}
      />
    </div>
  )
}
