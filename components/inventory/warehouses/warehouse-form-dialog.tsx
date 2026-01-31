"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import type { AxiosError } from "axios"

import { useCreateWarehouse, useUpdateWarehouse } from "@/lib/hooks/use-warehouses"
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
import type { Warehouse } from "@/lib/types/inventory"

type WarehouseFormValues = {
  name: string
  address: string
  description?: string
}

interface WarehouseFormDialogProps {
  warehouse: Warehouse | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WarehouseFormDialog({ warehouse, open, onOpenChange }: WarehouseFormDialogProps) {
  const toast = useToast()
  const createMutation = useCreateWarehouse()
  const updateMutation = useUpdateWarehouse()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<WarehouseFormValues>({
    defaultValues: {
      name: "",
      address: "",
      description: "",
    },
  })

  useEffect(() => {
    if (warehouse) {
      reset({
        name: warehouse.name,
        address: warehouse.address,
        description: warehouse.description || "",
      })
    } else {
      reset({
        name: "",
        address: "",
        description: "",
      })
    }
  }, [warehouse, open, reset])

  const onSubmit = (values: WarehouseFormValues) => {
    const action = warehouse
      ? updateMutation.mutateAsync({ id: warehouse.id, data: values })
      : createMutation.mutateAsync(values)

    action
      .then(() => {
        toast.success(warehouse ? "Warehouse updated" : "Warehouse created")
        onOpenChange(false)
      })
      .catch((e: AxiosError) => {
        const parsed = parseApiError(e)

        if (parsed.type === "validation") {
          Object.entries(parsed.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof WarehouseFormValues, { message })
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
          <DialogTitle>{warehouse ? "Edit Warehouse" : "Create Warehouse"}</DialogTitle>
          <DialogDescription>
            {warehouse ? "Update warehouse information" : "Add a new warehouse to the system"}
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
              {isPending ? "Saving..." : warehouse ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
