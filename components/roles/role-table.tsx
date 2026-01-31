"use client"

import { useMemo, useState } from "react"
import { MoreHorizontal, Plus, Search, Shield } from "lucide-react"
import { useRoles, useDeleteRole } from "@/lib/hooks/use-roles"
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
import { RoleFormDialog } from "./role-form-dialog"
import { RolePermissionsDialog } from "./role-permissions-dialog"
import type { Role } from "@/lib/types/role"
import { useRolePermissions } from "@/lib/hooks/use-roles"
import { useAuth } from "@/lib/hooks/use-auth"
import type { AxiosError } from "axios"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"
import { useToast } from "@/hooks/use-toast"

const PAGE_SIZE = 10

export function RoleTable() {
  const [search, setSearch] = useState("")
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)
  const [page, setPage] = useState(1)
  const itemsPerPage = 10

  const { hasPermission } = useAuth()
  const { data: roles = [], isLoading } = useRoles()
  const deleteMutation = useDeleteRole()
  const toast = useToast()

 const filteredRoles = useMemo(() => {
    const q = search.toLowerCase()
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(q) ||
        role.description?.toLowerCase().includes(q),
    )
  }, [roles, search])

  const paginatedRoles = filteredRoles?.slice(
  (page - 1) * itemsPerPage,
  page * itemsPerPage,
)

  // // keep page valid when search changes
  // if (page > totalPages) {
  //   setPage(totalPages)
  // }

  const handleEdit = (role: Role) => {
    setSelectedRole(role)
    setIsFormDialogOpen(true)
  }

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role)
    setIsPermissionsDialogOpen(true)
  }

  const handleDelete = (role: Role) => {
      setRoleToDelete(role)
    }


  const confirmDelete = () => {
    if (!roleToDelete) return

    deleteMutation.mutate(roleToDelete.id, {
      onSuccess: () => {
        toast.success("Role deleted", "The role was deleted successfully.")
        setRoleToDelete(null)
      },
      onError: (e: AxiosError) =>
        showApiErrorToast(parseApiError(e), toast, "Failed to delete role."),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        { hasPermission('role:create') && (<Button
          onClick={() => {
            setSelectedRole(null)
            setIsFormDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>)}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
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
            ) : paginatedRoles?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No roles found
                </TableCell>
              </TableRow>
            ) : (
              paginatedRoles?.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium font-mono">{role.name}</TableCell>
                  <TableCell className="text-muted-foreground">{role.description || "—"}</TableCell>
                  <TableCell>
                    <RolePermissionsList roleId={role.id} />
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
                        {hasPermission("role:update") && (<DropdownMenuItem onClick={() => handleEdit(role)}>Edit</DropdownMenuItem>)}
                        {hasPermission("role:assign-permission") && (<DropdownMenuItem onClick={() => handleManagePermissions(role)}>
                          <Shield className="h-4 w-4 mr-2" />
                          Manage Permissions
                        </DropdownMenuItem>)}
                        <DropdownMenuSeparator />
                        {hasPermission("role:delete") && (<DropdownMenuItem onClick={() => handleDelete(role)} className="text-destructive">
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

      {filteredRoles && filteredRoles.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * itemsPerPage + 1}–
            {Math.min(page * itemsPerPage, filteredRoles.length)} of{" "}
            {filteredRoles.length}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page * itemsPerPage >= filteredRoles.length}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <RoleFormDialog role={selectedRole} open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen} />
      <RolePermissionsDialog
        role={selectedRole}
        open={isPermissionsDialogOpen}
        onOpenChange={setIsPermissionsDialogOpen}
      />
      <ConfirmDeleteDialog
        open={!!roleToDelete}
        onOpenChange={(open) => !open && setRoleToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Role"
        description="Are you sure you want to delete this role? All users with this role will lose their associated permissions."
        itemName={roleToDelete?.name}
      />
    </div>
  )
}

function RolePermissionsList({ roleId }: { roleId: string }) {
  const { data: permissions } = useRoles()
  const rolePermissions = useRolePermissions(roleId)
  
  if (rolePermissions.isLoading) {
    return <span className="text-xs text-muted-foreground">Loading...</span>
  }
  
  if (!rolePermissions.data || rolePermissions.data.length === 0) {
    return <span className="text-xs text-muted-foreground">No permissions</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {rolePermissions.data?.map((permission) => (
        <span key={permission.id} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-mono">
          {permission.name}
        </span>
      ))}
    </div>
  )
}



