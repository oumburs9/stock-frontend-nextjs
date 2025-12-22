"use client"

import { useState } from "react"
import { MoreHorizontal, Plus, Search, CheckCircle2, XCircle, UserCog } from "lucide-react"
import { useUsers, useDeleteUser, useUpdateUserStatus } from "@/lib/hooks/use-users"
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
import { UserFormDialog } from "./user-form-dialog"
import { UserRolesDialog } from "./user-roles-dialog"
import type { User } from "@/lib/types/user"
import { useAuth } from "@/lib/hooks/use-auth"

export function UserTable() {
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const { hasPermission } = useAuth()
  const { data: users, isLoading } = useUsers()
  const deleteMutation = useDeleteUser()
  const updateStatusMutation = useUpdateUserStatus()

  const filteredUsers = users?.filter(
    (user) =>
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()),
  )

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const handleManageRoles = (user: User) => {
    setSelectedUser(user)
    setIsRolesDialogOpen(true)
  }

  const handleDelete = (user: User) => {
    setUserToDelete(user)
  }
  const confirmDelete = () => {
      if (userToDelete) {
        deleteMutation.mutate(userToDelete.id)
      }
  }

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    updateStatusMutation.mutate({ id, isActive: !currentStatus })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
       { hasPermission("user:create") && ( <Button
          onClick={() => {
            setSelectedUser(null)
            setIsDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button> )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
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
            ) : filteredUsers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span key={role.id} className="px-2 py-1 bg-muted rounded text-xs">
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                        <XCircle className="h-4 w-4" />
                        Inactive
                      </span>
                    )}
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
                        {hasPermission("user:update") && (<DropdownMenuItem onClick={() => handleEdit(user)}>Edit</DropdownMenuItem>) }
                        {hasPermission("user:assign-role") && (<DropdownMenuItem onClick={() => handleManageRoles(user)}>
                          <UserCog className="h-4 w-4 mr-2" />
                          Manage Roles
                        </DropdownMenuItem>)}
                        {hasPermission("user:update-status") && ( <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.isActive)}>
                          {user.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>) }
                        <DropdownMenuSeparator />
                       {hasPermission("user:delete") && ( <DropdownMenuItem onClick={() => handleDelete(user)} className="text-destructive">
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

      <UserFormDialog user={selectedUser} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <UserRolesDialog user={selectedUser} open={isRolesDialogOpen} onOpenChange={setIsRolesDialogOpen} />
      <ConfirmDeleteDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete User"
        description="Are you sure you want to delete this user? This will permanently remove the user and all associated data."
        itemName={
          userToDelete ? `${userToDelete.firstName} ${userToDelete.lastName} (${userToDelete.email})` : undefined
        }
      />
    </div>
  )
}
