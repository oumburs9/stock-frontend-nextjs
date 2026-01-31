"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useCreateAttribute, useUpdateAttribute } from "@/lib/hooks/use-attributes"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Attribute, AttributeDataType } from "@/lib/types/master-data"

type AttributeFormValues = {
  name: string
  label: string
  data_type: AttributeDataType
  is_required: boolean
}

interface AttributeFormDialogProps {
  attribute: Attribute | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AttributeFormDialog({ attribute, open, onOpenChange }: AttributeFormDialogProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const createMutation = useCreateAttribute()
  const updateMutation = useUpdateAttribute()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AttributeFormValues>({
    defaultValues: {
      name: "",
      label: "",
      data_type: "text",
      is_required: false,
    },
  })

  useEffect(() => {
    setFormError(null)

    if (attribute) {
      reset({
        name: attribute.name,
        label: attribute.label,
        data_type: attribute.data_type,
        is_required: attribute.is_required,
      })
    } else {
      reset({
        name: "",
        label: "",
        data_type: "text",
        is_required: false,
      })
    }
  }, [attribute, open, reset])

  const create = useFormMutation<AttributeFormValues, AttributeFormValues>({
    mutation: createMutation,
    setError,
    setFormError,
    successToast: {
      title: "Attribute created",
      description: "The attribute was added successfully.",
    },
    onSuccess: () => onOpenChange(false),
  })

  const update = useFormMutation<
    AttributeFormValues,
    { id: string; data: Partial<AttributeFormValues> }
  >({
    mutation: updateMutation,
    setError,
    setFormError,
    successToast: {
      title: "Attribute updated",
      description: "The attribute was updated successfully.",
    },
    onSuccess: () => onOpenChange(false),
  })

  const onSubmit = (values: AttributeFormValues) => {
    setFormError(null)

    const payload: AttributeFormValues = {
      name: values.name,
      label: values.label,
      data_type: values.data_type,
      is_required: !!values.is_required,
    }

    if (attribute) {
      update.submit({ id: attribute.id, data: payload })
    } else {
      create.submit(payload)
    }
  }

  const isPending = create.isPending || update.isPending
  const isRequired = watch("is_required")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{attribute ? "Edit Attribute" : "Create Attribute"}</DialogTitle>
          <DialogDescription>
            {attribute ? "Update attribute information" : "Add a new attribute to the system"}
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name (Internal)</Label>
            <Input id="name" {...register("name")} className="font-mono" />
            {errors.name?.message && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Use lowercase, no spaces (e.g., product_weight)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Label (Display)</Label>
            <Input id="label" {...register("label")} />
            {errors.label?.message && (
              <p className="text-sm text-destructive">{errors.label.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_type">Data Type</Label>
            <Select
              value={watch("data_type")}
              onValueChange={(value: AttributeDataType) =>
                setValue("data_type", value)
              }
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
            {errors.data_type?.message && (
              <p className="text-sm text-destructive">{errors.data_type.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_required"
              checked={isRequired}
              onCheckedChange={(checked) =>
                setValue("is_required", checked as boolean)
              }
            />
            <Label htmlFor="is_required" className="cursor-pointer font-normal">
              Required field
            </Label>
          </div>

          {errors.is_required?.message && (
            <p className="text-sm text-destructive">{errors.is_required.message}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : attribute ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
