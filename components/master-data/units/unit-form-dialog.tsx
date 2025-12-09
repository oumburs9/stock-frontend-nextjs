"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useCreateUnit, useUpdateUnit } from "@/lib/hooks/use-units"
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
import type { Unit } from "@/lib/types/master-data"

interface UnitFormDialogProps {
  unit: Unit | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnitFormDialog({ unit, open, onOpenChange }: UnitFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
    // description: "",
  })

  const createMutation = useCreateUnit()
  const updateMutation = useUpdateUnit()

  useEffect(() => {
    if (unit) {
      setFormData({
        name: unit.name,
        abbreviation: unit.abbreviation,
        // description: unit.description || "",
      })
    } else {
      setFormData({
        name: "",
        abbreviation: "",
        // description: "",
      })
    }
  }, [unit, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      name: formData.name,
      abbreviation: formData.abbreviation,
      // description: formData.description || undefined,
    }

    if (unit) {
      updateMutation.mutate(
        { id: unit.id, data: payload },
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
          <DialogTitle>{unit ? "Edit Unit" : "Create Unit"}</DialogTitle>
          <DialogDescription>{unit ? "Update unit information" : "Add a new unit to the system"}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Kilogram"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="abbreviation">Abbreviation</Label>
            <Input
              id="abbreviation"
              value={formData.abbreviation}
              onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
              required
              placeholder="e.g., kg"
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
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : unit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
