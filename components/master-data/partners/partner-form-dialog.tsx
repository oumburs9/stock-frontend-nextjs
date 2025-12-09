"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useCreatePartner, useUpdatePartner } from "@/lib/hooks/use-partners"
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

interface PartnerFormDialogProps {
  partner: Partner | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PartnerFormDialog({ partner, open, onOpenChange }: PartnerFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    is_supplier: false,
    is_customer: false,
  })

  const createMutation = useCreatePartner()
  const updateMutation = useUpdatePartner()

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name,
        email: partner.email || "",
        phone: partner.phone || "",
        address: partner.address || "",
        is_supplier: partner.is_supplier,
        is_customer: partner.is_customer,
      })
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        is_supplier: false,
        is_customer: false,
      })
    }
  }, [partner, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      is_supplier: formData.is_supplier,
      is_customer: formData.is_customer,
    }

    if (partner) {
      updateMutation.mutate(
        { id: partner.id, data: payload },
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{partner ? "Edit Partner" : "Create Partner"}</DialogTitle>
          <DialogDescription>
            {partner ? "Update partner information" : "Add a new partner to the system"}
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
            />
          </div>
          <div className="space-y-3">
            <Label>Partner Type</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_supplier"
                  checked={formData.is_supplier}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_supplier: checked as boolean })}
                />
                <Label htmlFor="is_supplier" className="cursor-pointer font-normal">
                  Supplier
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_customer"
                  checked={formData.is_customer}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_customer: checked as boolean })}
                />
                <Label htmlFor="is_customer" className="cursor-pointer font-normal">
                  Customer
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : partner ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
