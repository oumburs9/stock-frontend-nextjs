"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useCreateWarehouse, useUpdateWarehouse } from "@/lib/hooks/use-warehouses"
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
import type { Warehouse } from "@/lib/types/inventory"
import { useAuth } from "@/lib/hooks/use-auth"

interface WarehouseFormDialogProps {
  warehouse: Warehouse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WarehouseFormDialog({ warehouse, open, onOpenChange }: WarehouseFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
  })
  const { hasPermission } = useAuth()

  const createMutation = useCreateWarehouse()
  const updateMutation = useUpdateWarehouse()

  const canSubmit = warehouse
    ? hasPermission("warehouse:update")
    : hasPermission("warehouse:create")

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name,
        address: warehouse.address,
        description: warehouse.description || "",
      })
    } else {
      setFormData({
        name: "",
        address: "",
        description: "",
      })
    }
  }, [warehouse, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.address.trim()) {
      return
    }

    const payload = {
      name: formData.name,
      address: formData.address,
      description: formData.description || undefined,
    }

    if (warehouse) {
      updateMutation.mutate(
        { id: warehouse.id, data: payload },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        },
      )
    } else {
      createMutation.mutate(payload, {
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
          <DialogTitle>{warehouse ? "Edit Warehouse" : "Create Warehouse"}</DialogTitle>
          <DialogDescription>
            {warehouse ? "Update warehouse information" : "Add a new warehouse to the system"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : warehouse ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
