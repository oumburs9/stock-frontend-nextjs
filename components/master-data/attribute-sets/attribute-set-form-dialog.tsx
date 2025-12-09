"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useCreateAttributeSet, useUpdateAttributeSet } from "@/lib/hooks/use-attribute-sets"
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
import type { AttributeSet } from "@/lib/types/master-data"

interface AttributeSetFormDialogProps {
  set: AttributeSet | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AttributeSetFormDialog({ set, open, onOpenChange }: AttributeSetFormDialogProps) {
  const [name, setName] = useState("")

  const createMutation = useCreateAttributeSet()
  const updateMutation = useUpdateAttributeSet()

  useEffect(() => {
    if (set) {
      setName(set.name)
    } else {
      setName("")
    }
  }, [set, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (set) {
      updateMutation.mutate(
        { id: set.id, data: { name } },
        {
          onSuccess: () => onOpenChange(false),
        },
      )
    } else {
      createMutation.mutate(
        { name },
        {
          onSuccess: () => onOpenChange(false),
        },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{set ? "Edit Attribute Set" : "Create Attribute Set"}</DialogTitle>
          <DialogDescription>{set ? "Update attribute set name" : "Add a new attribute set"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : set ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
