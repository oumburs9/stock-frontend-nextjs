"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { useRoles } from "@/lib/hooks/use-roles"
import { useUpdateUserRoles } from "@/lib/hooks/use-users"
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
import type { User } from "@/lib/types/user"

interface UserRolesDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserRolesDialog({ user, open, onOpenChange }: UserRolesDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  const { data: allRoles } = useRoles()
  const updateMutation = useUpdateUserRoles()

  useEffect(() => {
   if (user && user.roles) {
      setSelectedRoles(user.roles.map(r => r.id))
    } else {
      setSelectedRoles([])
    }
    setSearchQuery("")
  }, [user, open])

  const filteredRoles = allRoles?.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleToggle = (roleId: string) => {
    setSelectedRoles((prev) => (prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]))
  }

  const handleSubmit = () => {
    if (user) {
      updateMutation.mutate(
        {
          id: user.id,
          roleIds: selectedRoles,
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
          <DialogTitle>Manage Roles</DialogTitle>
          <DialogDescription>
            Select roles for{" "}
            <span className="font-semibold">
              {user?.firstName} {user?.lastName}
            </span>
          </DialogDescription>user
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="space-y-3 max-h-[400px] overflow-y-auto py-2">
          {filteredRoles?.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">No roles found</div>
          ) : (
            filteredRoles?.map((role) => (
              <div key={role.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted">
                <Checkbox
                  id={role.id}
                  checked={selectedRoles.includes(role.id)}
                  onCheckedChange={() => handleToggle(role.id)}
                />
                <div className="flex-1">
                  <Label htmlFor={role.id} className="font-mono text-sm cursor-pointer">
                    {role.name}
                  </Label>
                  {role.description && <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>}
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
