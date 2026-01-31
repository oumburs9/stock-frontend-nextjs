"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import type { AxiosError } from "axios"
import { useCreateBrand, useUpdateBrand } from "@/lib/hooks/use-brands"
import { parseApiError } from "@/lib/api/parse-api-error"
import { showApiErrorToast } from "@/lib/api/show-api-error-toast"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Brand } from "@/lib/types/master-data"

type BrandFormValues = {
  name: string
}

interface BrandFormDialogProps {
  brand: Brand | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BrandFormDialog({ brand, open, onOpenChange }: BrandFormDialogProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const { success, error, warning } = useToast()
  const createMutation = useCreateBrand()
  const updateMutation = useUpdateBrand()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<BrandFormValues>({
    defaultValues: { name: "" },
  })

  useEffect(() => {
    setFormError(null)
    if (brand) {
      reset({ name: brand.name })
    } else {
      reset({ name: "" })
    }
  }, [brand, open, reset])

  const onSubmit = (values: BrandFormValues) => {
    setFormError(null)

    const payload = {
      name: values.name,
    }

    if (brand) {
      updateMutation.mutate(
        { id: brand.id, data: payload },
        {
          onSuccess: () => {
            success("Brand updated", "The brand was updated successfully.")
            onOpenChange(false)
          },
          onError: (e: unknown) => {
            const axiosError = e as AxiosError
            const parsed = parseApiError(axiosError)

            if (parsed.type === "validation") {
              Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
                setError(field as keyof BrandFormValues, { message })
              })
              if (parsed.formError) setFormError(parsed.formError)
              return
            }

            showApiErrorToast(parsed, { error, warning }, "Failed to update brand.")
          },
        },
      )
      return
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        success("Brand created", "The brand was created successfully.")
        onOpenChange(false)
      },
      onError: (e: AxiosError) => {
        const parsed = parseApiError(e)

        if (parsed.type === "validation") {
          Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof BrandFormValues, { message })
          })
          if (parsed.formError) setFormError(parsed.formError)
          return
        }

        showApiErrorToast(parsed, { error, warning }, "Failed to create brand.")
      },
    })
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{brand ? "Edit Brand" : "Create Brand"}</DialogTitle>
          <DialogDescription>{brand ? "Update brand information" : "Add a new brand to the system"}</DialogDescription>
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
            />
            {errors.name?.message && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : brand ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
