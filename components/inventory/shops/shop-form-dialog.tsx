"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import type { AxiosError } from "axios"

import { useCreateShop, useUpdateShop } from "@/lib/hooks/use-shops"
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
import type { Shop } from "@/lib/types/inventory"

type ShopFormValues = {
  name: string
  address: string
  description?: string
}

interface ShopFormDialogProps {
  shop: Shop | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShopFormDialog({ shop, open, onOpenChange }: ShopFormDialogProps) {
  const toast = useToast()
  const createMutation = useCreateShop()
  const updateMutation = useUpdateShop()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ShopFormValues>({
    defaultValues: {
      name: "",
      address: "",
      description: "",
    },
  })

  useEffect(() => {
    if (shop) {
      reset({
        name: shop.name,
        address: shop.address,
        description: shop.description || "",
      })
    } else {
      reset({
        name: "",
        address: "",
        description: "",
      })
    }
  }, [shop, open, reset])

  const onSubmit = (values: ShopFormValues) => {
    const action = shop
      ? updateMutation.mutateAsync({ id: shop.id, data: values })
      : createMutation.mutateAsync(values)

    action
      .then(() => {
        toast.success(shop ? "Shop updated" : "Shop created")
        onOpenChange(false)
      })
      .catch((e: AxiosError) => {
        const parsed = parseApiError(e)

        if (parsed.type === "validation") {
          Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof ShopFormValues, { message })
          })
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
          <DialogTitle>{shop ? "Edit Shop" : "Create Shop"}</DialogTitle>
          <DialogDescription>
            {shop ? "Update shop information" : "Add a new shop to the system"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name?.message && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} />
            {errors.address?.message && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
            {errors.description?.message && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : shop ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
