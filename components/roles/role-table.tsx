"use client"

import { useState } from "react"
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

export function RoleTable() {
  const [search, setSearch] = useState("")
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  const { data: roles, isLoading } = useRoles()
  const deleteMutation = useDeleteRole()

  const filteredRoles = roles?.filter(
    (role) =>
      role.name.toLowerCase().includes(search.toLowerCase()) ||
      role.description?.toLowerCase().includes(search.toLowerCase()),
  )

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
  // const handleDelete = (id: string) => {
  //   if (confirm("Are you sure you want to delete this role?")) {
  //     deleteMutation.mutate(id)
  //   }
  // }

    const confirmDelete = () => {
      if (roleToDelete) {
        deleteMutation.mutate(roleToDelete.id)
      }
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
        <Button
          onClick={() => {
            setSelectedRole(null)
            setIsFormDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
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
            ) : filteredRoles?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No roles found
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles?.map((role) => (
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
                        <DropdownMenuItem onClick={() => handleEdit(role)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManagePermissions(role)}>
                          <Shield className="h-4 w-4 mr-2" />
                          Manage Permissions
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(role)} className="text-destructive">
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

import { useRolePermissions } from "@/lib/hooks/use-roles"
