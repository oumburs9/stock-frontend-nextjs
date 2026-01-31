"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useCreateAttributeSet, useUpdateAttributeSet } from "@/lib/hooks/use-attribute-sets"
import { useFormMutation } from "@/hooks/use-form-mutation"
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
import { useAuth } from "@/lib/hooks/use-auth"

type AttributeSetFormValues = {
  name: string
}

interface AttributeSetFormDialogProps {
  set: AttributeSet | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AttributeSetFormDialog({ set, open, onOpenChange }: AttributeSetFormDialogProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const { hasPermission } = useAuth()

  const createMutation = useCreateAttributeSet()
  const updateMutation = useUpdateAttributeSet()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AttributeSetFormValues>({
    defaultValues: { name: "" },
  })

  useEffect(() => {
    setFormError(null)
    reset({ name: set?.name || "" })
  }, [set, open, reset])

  const create = useFormMutation<AttributeSetFormValues, AttributeSetFormValues>({
    mutation: createMutation,
    setError,
    setFormError,
    successToast: {
      title: "Attribute set created",
      description: "The attribute set was added successfully.",
    },
    onSuccess: () => onOpenChange(false),
  })

  const update = useFormMutation<
    AttributeSetFormValues,
    { id: string; data:  Partial<AttributeSetFormValues> }
  >({
    mutation: updateMutation,
    setError,
    setFormError,
    successToast: {
      title: "Attribute set updated",
      description: "The attribute set was updated successfully.",
    },
    onSuccess: () => onOpenChange(false),
  })

  const onSubmit = (values: AttributeSetFormValues) => {
    setFormError(null)

    if (set) {
      update.submit({ id: set.id, data: values })
    } else {
      create.submit(values)
    }
  }

  const canSubmit = set
    ? hasPermission("attribute-set:update")
    : hasPermission("attribute-set:create")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{set ? "Edit Attribute Set" : "Create Attribute Set"}</DialogTitle>
          <DialogDescription>
            {set ? "Update attribute set name" : "Add a new attribute set"}
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name?.message && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || create.isPending || update.isPending}>
              {create.isPending || update.isPending ? "Saving..." : set ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
