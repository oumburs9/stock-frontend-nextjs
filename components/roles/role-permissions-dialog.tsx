"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { useRolePermissions, useUpdateRolePermissions } from "@/lib/hooks/use-roles"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { Role } from "@/lib/types/role"

interface RolePermissionsDialogProps {
  role: Role | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RolePermissionsDialog({ role, open, onOpenChange }: RolePermissionsDialogProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const { data: allPermissions } = usePermissions()
  const { data: rolePermissions } = useRolePermissions(role?.id || null)
  const updateMutation = useUpdateRolePermissions()

  useEffect(() => {
    if (rolePermissions) {
      setSelectedPermissions(rolePermissions)
    } else {
      setSelectedPermissions([])
    }
    setSearchQuery("")
  }, [rolePermissions, open])

  const filteredPermissions = allPermissions?.filter(
    (permission) =>
      permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      permission.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleToggle = (permissionName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionName) ? prev.filter((p) => p !== permissionName) : [...prev, permissionName],
    )
  }

  const handleSubmit = () => {
    if (role) {
      updateMutation.mutate(
        {
          id: role.id,
          permissionIds: selectedPermissions,
        },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Permissions</DialogTitle>
          <DialogDescription>
            Select permissions for the <span className="font-mono font-semibold">{role?.name}</span> role
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="space-y-3 max-h-[400px] overflow-y-auto py-2">
          {filteredPermissions?.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">No permissions found</div>
          ) : (
            filteredPermissions?.map((permission) => (
              <div key={permission.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted">
                <Checkbox
                  id={permission.id}
                  checked={selectedPermissions.includes(permission.name)}
                  onCheckedChange={() => handleToggle(permission.name)}
                />
                <div className="flex-1">
                  <Label htmlFor={permission.id} className="font-mono text-sm cursor-pointer">
                    {permission.name}
                  </Label>
                  {permission.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{permission.description}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
