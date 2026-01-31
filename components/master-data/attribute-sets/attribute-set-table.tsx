"use client"

import { useState } from "react"
import type { AxiosError } from "axios"
import { MoreHorizontal, Plus, Search, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAttributeSets, useDeleteAttributeSet } from "@/lib/hooks/use-attribute-sets"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"
import { useToast } from "@/hooks/use-toast"
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
import { useAuth } from "@/lib/hooks/use-auth"

export function AttributeSetTable() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [selectedSet, setSelectedSet] = useState<AttributeSet | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [setToDelete, setSetToDelete] = useState<AttributeSet | null>(null)

  const { hasPermission } = useAuth()
  const { success, error: errorToast, warning } = useToast()

  const { data: sets, isLoading } = useAttributeSets()
  const deleteMutation = useDeleteAttributeSet()

  const filteredSets = sets?.filter((set) =>
    set.name.toLowerCase().includes(search.toLowerCase()),
  )

  const confirmDelete = () => {
    if (!setToDelete) return

    deleteMutation.mutate(setToDelete.id, {
      onSuccess: () => {
        success("Attribute set deleted", "The attribute set was deleted successfully.")
        setSetToDelete(null)
      },
      onError: (e: AxiosError) => {
        const parsed = parseApiError(e)
        showApiErrorToast(parsed, { error: errorToast, warning }, "Failed to delete attribute set.")
      },
    })
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
        {hasPermission("attribute-set:create") && (
          <Button onClick={() => { setSelectedSet(null); setIsDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Attribute Set
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Attributes</TableHead>
              <TableHead className="w-[70px]" />
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
                    <span className="px-2 py-1 bg-muted rounded text-xs">
                      {set.items?.length || 0} attribute(s)
                    </span>
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
                        {hasPermission("attribute-set:view") && (
                          <DropdownMenuItem onClick={() => handleManageAttributes(set.id)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Manage Attributes
                          </DropdownMenuItem>
                        )}
                        {hasPermission("attribute-set:update") && (
                          <DropdownMenuItem onClick={() => { setSelectedSet(set); setIsDialogOpen(true) }}>
                            Edit Name
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {hasPermission("attribute-set:delete") && (
                          <DropdownMenuItem
                            onClick={() => setSetToDelete(set)}
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
