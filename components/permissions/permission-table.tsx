"use client"

import { useState } from "react"
import { MoreHorizontal, Plus, Search } from "lucide-react"
import { usePermissions, useDeletePermission } from "@/lib/hooks/use-permissions"
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
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog"
import { PermissionFormDialog } from "./permission-form-dialog"
import type { Permission } from "@/lib/types/permission"
import { useAuth } from "@/lib/hooks/use-auth"
import type { AxiosError } from "axios"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"
import { useToast } from "@/hooks/use-toast"

export function PermissionTable() {
  const [search, setSearch] = useState("")
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null)
  const toast = useToast()
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  const { hasPermission } = useAuth()
  const { data: permissions, isLoading } = usePermissions()
  const deleteMutation = useDeletePermission()

  const filteredPermissions = permissions?.filter(
    (permission) =>
      permission.name.toLowerCase().includes(search.toLowerCase()) ||
      permission.description?.toLowerCase().includes(search.toLowerCase()),
  )

  const totalPages = Math.max(1, Math.ceil((filteredPermissions?.length ?? 0) / itemsPerPage))
  const startIndex = (page - 1) * itemsPerPage
  const paginatedPermissions = filteredPermissions?.slice(startIndex, startIndex + itemsPerPage)

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission)
    setIsDialogOpen(true)
  }


  const handleDelete = (permission: Permission) => {
    setPermissionToDelete(permission)
  }

  const confirmDelete = () => {
    if (!permissionToDelete) return

    deleteMutation.mutate(permissionToDelete.id, {
      onSuccess: () => {
        toast.success("Permission deleted", "The permission was deleted successfully.")
        setPermissionToDelete(null)
      },
      onError: (e: AxiosError) =>{
        console.log(e)
        showApiErrorToast(parseApiError(e), toast, "Failed to delete permission.")}
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search permissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {hasPermission("permission:create") && (
        <Button
          onClick={() => {
            setSelectedPermission(null)
            setIsDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Permission
        </Button>)}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
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
            ) : paginatedPermissions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No permissions found
                </TableCell>
              </TableRow>
            ) : (
              paginatedPermissions?.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium font-mono">{permission.name}</TableCell>
                  <TableCell className="text-muted-foreground">{permission.description || "—"}</TableCell>
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
                        {hasPermission("permission:update") && (<DropdownMenuItem onClick={() => handleEdit(permission)}>Edit</DropdownMenuItem>)}
                        <DropdownMenuSeparator />
                        {hasPermission("permission:delete") && (<DropdownMenuItem onClick={() => handleDelete(permission)} className="text-destructive">
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

      {filteredPermissions && filteredPermissions.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * itemsPerPage + 1}–
            {Math.min(page * itemsPerPage, filteredPermissions.length)} of{" "}
            {filteredPermissions.length}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page * itemsPerPage >= filteredPermissions.length}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <PermissionFormDialog permission={selectedPermission} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <ConfirmDeleteDialog
        open={!!permissionToDelete}
        onOpenChange={(open) => !open && setPermissionToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Permission"
        description="Are you sure you want to delete this permission? This permission will be removed from all roles."
        itemName={permissionToDelete?.name}
      />
    </div>
  )
}
