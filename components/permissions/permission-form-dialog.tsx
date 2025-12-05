"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useCreatePermission, useUpdatePermission } from "@/lib/hooks/use-permissions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Permission } from "@/lib/types/permission"

interface PermissionFormDialogProps {
  permission: Permission | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PermissionFormDialog({ permission, open, onOpenChange }: PermissionFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  const createMutation = useCreatePermission()
  const updateMutation = useUpdatePermission()

  useEffect(() => {
    if (permission) {
      setFormData({
        name: permission.name,
        description: permission.description || "",
      })
    } else {
      setFormData({
        name: "",
        description: "",
      })
    }
  }, [permission, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (permission) {
      updateMutation.mutate(
        {
          id: permission.id,
          data: { description: formData.description },
        },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        },
      )
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          onOpenChange(false)
        },
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{permission ? "Edit Permission" : "Create Permission"}</DialogTitle>
          <DialogDescription>
            {permission ? "Update permission information" : "Add a new permission to the system"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., stock:transfer"
              required
              disabled={!!permission}
            />
            {permission && <p className="text-xs text-muted-foreground">Permission names cannot be changed</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this permission allows..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : permission ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
