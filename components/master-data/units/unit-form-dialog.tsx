"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import type { AxiosError } from "axios"
import { useCreateUnit, useUpdateUnit } from "@/lib/hooks/use-units"
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
import type { Unit, UpdateUnitRequest } from "@/lib/types/master-data"

type UnitFormValues = {
  name: string
  abbreviation: string
}

interface UnitFormDialogProps {
  unit: Unit | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnitFormDialog({ unit, open, onOpenChange }: UnitFormDialogProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const createMutation = useCreateUnit()
  const updateMutation = useUpdateUnit()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UnitFormValues>({
    defaultValues: { name: "", abbreviation: "" },
  })

  useEffect(() => {
    setFormError(null)

    if (unit) {
      reset({ name: unit.name, abbreviation: unit.abbreviation })
    } else {
      reset({ name: "", abbreviation: "" })
    }
  }, [unit, open, reset])

  const create = useFormMutation<UnitFormValues, UnitFormValues>({
    mutation: createMutation,
    setError,
    setFormError,
    successToast: { title: "Unit created", description: "The unit was created successfully." },
    onSuccess: () => onOpenChange(false),
  })

    const update = useFormMutation<
      UnitFormValues,
      { id: string; data: UpdateUnitRequest }
    >({
      mutation: updateMutation,
      setError,
      setFormError,
      successToast: {
        title: "Unit updated",
        description: "The unit was updated successfully.",
      },
      onSuccess: () => onOpenChange(false),
    })


  const onSubmit = (values: UnitFormValues) => {
    setFormError(null)

    if (unit) {
      update.submit({ id: unit.id, data: values })
    } else {
      create.submit(values)
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{unit ? "Edit Unit" : "Create Unit"}</DialogTitle>
          <DialogDescription>{unit ? "Update unit information" : "Add a new unit to the system"}</DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} placeholder="e.g., Kilogram" />
            {errors.name?.message && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abbreviation">Abbreviation</Label>
            <Input id="abbreviation" {...register("abbreviation")} placeholder="e.g., kg" />
            {errors.abbreviation?.message && (
              <p className="text-sm text-destructive">{errors.abbreviation.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : unit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
