"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useCreatePartner, useUpdatePartner } from "@/lib/hooks/use-partners"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import type { Partner } from "@/lib/types/master-data"

type PartnerFormValues = {
  name: string
  email?: string
  phone?: string
  address?: string
  is_supplier: boolean
  is_customer: boolean
}

interface PartnerFormDialogProps {
  partner: Partner | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PartnerFormDialog({ partner, open, onOpenChange }: PartnerFormDialogProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const createMutation = useCreatePartner()
  const updateMutation = useUpdatePartner()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PartnerFormValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      is_supplier: false,
      is_customer: false,
    },
  })

  useEffect(() => {
    setFormError(null)

    if (partner) {
      reset({
        name: partner.name,
        email: partner.email || "",
        phone: partner.phone || "",
        address: partner.address || "",
        is_supplier: partner.is_supplier,
        is_customer: partner.is_customer,
      })
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        address: "",
        is_supplier: false,
        is_customer: false,
      })
    }
  }, [partner, open, reset])

  const create = useFormMutation<PartnerFormValues, PartnerFormValues>({
    mutation: createMutation,
    setError,
    setFormError,
    successToast: { title: "Partner created", description: "The partner was added successfully." },
    onSuccess: () => onOpenChange(false),
  })

  const update = useFormMutation<PartnerFormValues, { id: string; data: Partial<PartnerFormValues> }>({
    mutation: updateMutation,
    setError,
    setFormError,
    successToast: { title: "Partner updated", description: "The partner was updated successfully." },
    onSuccess: () => onOpenChange(false),
  })

  const onSubmit = (values: PartnerFormValues) => {
    setFormError(null)

    const payload = {
      name: values.name,
      email: values.email?.trim() ? values.email.trim() : undefined,
      phone: values.phone?.trim() ? values.phone.trim() : undefined,
      address: values.address?.trim() ? values.address.trim() : undefined,
      is_supplier: !!values.is_supplier,
      is_customer: !!values.is_customer,
    }

    if (partner) {
      update.submit({ id: partner.id, data: payload })
    } else {
      create.submit(payload)
    }
  }

  const isPending = create.isPending || update.isPending
  const isSupplier = watch("is_supplier")
  const isCustomer = watch("is_customer")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{partner ? "Edit Partner" : "Create Partner"}</DialogTitle>
          <DialogDescription>{partner ? "Update partner information" : "Add a new partner to the system"}</DialogDescription>
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
            {errors.name?.message && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email?.message && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
              {errors.phone?.message && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" rows={2} {...register("address")} />
            {errors.address?.message && <p className="text-sm text-destructive">{errors.address.message}</p>}
          </div>

          <div className="space-y-3">
            <Label>Partner Type</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_supplier"
                  checked={isSupplier}
                  onCheckedChange={(checked) => setValue("is_supplier", checked as boolean)}
                />
                <Label htmlFor="is_supplier" className="cursor-pointer font-normal">
                  Supplier
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_customer"
                  checked={isCustomer}
                  onCheckedChange={(checked) => setValue("is_customer", checked as boolean)}
                />
                <Label htmlFor="is_customer" className="cursor-pointer font-normal">
                  Customer
                </Label>
              </div>
            </div>
            {(errors.is_supplier?.message || errors.is_customer?.message) && (
              <p className="text-sm text-destructive">{errors.is_supplier?.message || errors.is_customer?.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : partner ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
