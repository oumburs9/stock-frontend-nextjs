"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useCreateBrand, useUpdateBrand } from "@/lib/hooks/use-brands"
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
import type { Brand } from "@/lib/types/master-data"

interface BrandFormDialogProps {
  brand: Brand | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BrandFormDialog({ brand, open, onOpenChange }: BrandFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    // description: "",
  })

  const createMutation = useCreateBrand()
  const updateMutation = useUpdateBrand()

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name,
        // description: brand.description || "",
      })
    } else {
      setFormData({
        name: "",
        // description: "",
      })
    }
  }, [brand, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      name: formData.name,
      // description: formData.description || undefined,
    }

    if (brand) {
      updateMutation.mutate(
        { id: brand.id, data: payload },
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
          <DialogTitle>{brand ? "Edit Brand" : "Create Brand"}</DialogTitle>
          <DialogDescription>{brand ? "Update brand information" : "Add a new brand to the system"}</DialogDescription>
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
          {/* <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div> */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : brand ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
