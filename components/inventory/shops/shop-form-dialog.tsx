"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useCreateShop, useUpdateShop } from "@/lib/hooks/use-shops"
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
import type { Shop } from "@/lib/types/inventory"

interface ShopFormDialogProps {
  shop: Shop | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShopFormDialog({ shop, open, onOpenChange }: ShopFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
  })

  const createMutation = useCreateShop()
  const updateMutation = useUpdateShop()

  useEffect(() => {
    if (shop) {
      setFormData({
        name: shop.name,
        address: shop.address,
        description: shop.description || "",
      })
    } else {
      setFormData({
        name: "",
        address: "",
        description: "",
      })
    }
  }, [shop, open])

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

    if (shop) {
      updateMutation.mutate(
        { id: shop.id, data: payload },
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
          <DialogTitle>{shop ? "Edit Shop" : "Create Shop"}</DialogTitle>
          <DialogDescription>{shop ? "Update shop information" : "Add a new shop to the system"}</DialogDescription>
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
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : shop ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
