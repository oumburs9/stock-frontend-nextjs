"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useCreateCategory, useUpdateCategory, useCategories } from "@/lib/hooks/use-categories"
import { useAttributeSets } from "@/lib/hooks/use-attribute-sets"
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
// import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category } from "@/lib/types/master-data"

interface CategoryFormDialogProps {
  category: Category | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryFormDialog({ category, open, onOpenChange }: CategoryFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    // description: "",
    parent_id: null,
    attribute_set_id: null,
  })

  const { data: categories } = useCategories()
  const { data: attributeSets } = useAttributeSets()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        // description: category.description || "",
        parent_id: category.parent_id || null,
        attribute_set_id: category.attribute_set_id || null,
      })
    } else {
      setFormData({
        name: "",
        // description: "",
        parent_id: null,
        attribute_set_id: null,
      })
    }
  }, [category, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      name: formData.name,
      // description: formData.description || undefined,
      parent_id: formData.parent_id,
      attribute_set_id: formData.attribute_set_id,
    }

    if (category) {
      updateMutation.mutate(
        { id: category.id, data: payload },
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
          <DialogTitle>{category ? "Edit Category" : "Create Category"}</DialogTitle>
          <DialogDescription>
            {category ? "Update category information" : "Add a new category to the system"}
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
          {/* <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div> */}
          <div className="space-y-2">
            <Label htmlFor="parent_id">Parent Category (Optional)</Label>
            <Select value={formData.parent_id} onValueChange={(value) => setFormData({ ...formData, parent_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select parent category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>None (Main Category)</SelectItem>
                {categories
                  ?.filter((c) => c.id !== category?.id)
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="attribute_set_id">Attribute Set (Optional)</Label>
            <Select
              value={formData.attribute_set_id || "none"}
              onValueChange={(value) => setFormData({ ...formData, attribute_set_id: value === "none" ? null : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select attribute set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {attributeSets?.map((set) => (
                  <SelectItem key={set.id} value={set.id}>
                    {set.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Products in this category will use these attributes</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : category ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
