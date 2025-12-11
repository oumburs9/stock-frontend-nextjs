"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWarehouses } from "@/lib/hooks/use-warehouses"
import { useShops } from "@/lib/hooks/use-shops"
import { useProducts } from "@/lib/hooks/use-products"
import type { StockSnapshot } from "@/lib/types/inventory"

const stockSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  warehouseId: z.string().optional(),
  shopId: z.string().optional(),
  onHand: z.number().min(0, "On hand quantity must be 0 or greater"),
  reserved: z.number().min(0, "Reserved quantity must be 0 or greater"),
})

type StockFormValues = z.infer<typeof stockSchema>

interface StockFormDialogProps {
  stock: StockSnapshot | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StockFormDialog({ stock, open, onOpenChange }: StockFormDialogProps) {
  const { data: warehouses } = useWarehouses()
  const { data: shops } = useShops()
  const { data: products } = useProducts()

  const form = useForm<StockFormValues>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      productId: "",
      warehouseId: "",
      shopId: "",
      onHand: 0,
      reserved: 0,
    },
  })

  useEffect(() => {
    if (stock) {
      form.reset({
        productId: stock.product.id,
        warehouseId: stock.warehouse?.id || "",
        shopId: stock.shop?.id || "",
        onHand: stock.onHand || 0,
        reserved: stock.reserved || 0,
      })
    } else {
      form.reset({
        productId: "",
        warehouseId: "",
        shopId: "",
        onHand: 0,
        reserved: 0,
      })
    }
  }, [stock, open, form])

  const onSubmit = (values: StockFormValues) => {
    console.log("[v0] Stock form submitted:", values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{stock ? "Update Stock" : "Create Stock Entry"}</DialogTitle>
          <DialogDescription>
            {stock ? "Update stock quantities for this location" : "Create a new stock entry"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warehouse</FormLabel>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehouses?.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shopId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shop</FormLabel>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shop" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {shops?.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id}>
                          {shop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="onHand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>On Hand Quantity *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reserved"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reserved Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Stock</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
