"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import type { AxiosError } from "axios"

import { useCreatePermission, useUpdatePermission } from "@/lib/hooks/use-permissions"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"
import { useToast } from "@/hooks/use-toast"

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

type PermissionFormValues = {
  name: string
  description?: string
}

interface PermissionFormDialogProps {
  permission: Permission | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PermissionFormDialog({ permission, open, onOpenChange }: PermissionFormDialogProps) {
  const toast = useToast()
  const createMutation = useCreatePermission()
  const updateMutation = useUpdatePermission()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PermissionFormValues>({
    defaultValues: { name: "", description: "" },
  })

  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    setFormError(null)

    if (permission) {
      reset({
        name: permission.name,
        description: permission.description || "",
      })
    } else {
      reset({ name: "", description: "" })
    }
  }, [permission, open, reset])

  const onSubmit = (values: PermissionFormValues) => {
    setFormError(null)

    const action = permission
      ? updateMutation.mutateAsync({
          id: permission.id,
          data: { description: values.description },
        })
      : createMutation.mutateAsync(values)

    action
      .then(() => {
        toast.success(permission ? "Permission updated" : "Permission created")
        onOpenChange(false)
      })
      .catch((e: AxiosError) => {
        const parsed = parseApiError(e)

        if (parsed.type === "validation") {
          Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof PermissionFormValues, { message })
          })
          if (parsed.formError) setFormError(parsed.formError)
          return
        }

        showApiErrorToast(parsed, toast)
      })
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{permission ? "Edit Permission" : "Create Permission"}</DialogTitle>
          <DialogDescription>
            {permission ? "Update permission information" : "Add a new permission to the system"}
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
            <Input
              id="name"
              {...register("name")}
              disabled={!!permission}
              placeholder="e.g., stock:transfer"
            />
            {permission && (
              <p className="text-xs text-muted-foreground">
                Permission names cannot be changed
              </p>
            )}
            {errors.name?.message && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              {...register("description")}
              placeholder="Describe what this permission allows..."
            />
            {errors.description?.message && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : permission ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
