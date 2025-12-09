"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useCreateAttribute, useUpdateAttribute } from "@/lib/hooks/use-attributes"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Attribute, AttributeDataType } from "@/lib/types/master-data"

interface AttributeFormDialogProps {
  attribute: Attribute | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AttributeFormDialog({ attribute, open, onOpenChange }: AttributeFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    data_type: "text" as AttributeDataType,
    is_required: false,
  })

  const createMutation = useCreateAttribute()
  const updateMutation = useUpdateAttribute()

  useEffect(() => {
    if (attribute) {
      setFormData({
        name: attribute.name,
        label: attribute.label,
        data_type: attribute.data_type,
        is_required: attribute.is_required,
      })
    } else {
      setFormData({
        name: "",
        label: "",
        data_type: "text",
        is_required: false,
      })
    }
  }, [attribute, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (attribute) {
      updateMutation.mutate(
        { id: attribute.id, data: formData },
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
          <DialogTitle>{attribute ? "Edit Attribute" : "Create Attribute"}</DialogTitle>
          <DialogDescription>
            {attribute ? "Update attribute information" : "Add a new attribute to the system"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name (Internal)</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., color, size"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">Use lowercase, no spaces (e.g., product_weight)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="label">Label (Display)</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              required
              placeholder="e.g., Product Color, Size"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="data_type">Data Type</Label>
            <Select
              value={formData.data_type}
              onValueChange={(value: AttributeDataType) => setFormData({ ...formData, data_type: value })}
            >
              <SelectTrigger id="data_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_required"
              checked={formData.is_required}
              onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked === true })}
            />
            <Label htmlFor="is_required" className="cursor-pointer">
              Required field
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : attribute ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
