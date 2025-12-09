"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { productService } from "@/lib/services/product.service"
import type { CreateProductRequest, UpdateProductRequest } from "@/lib/types/master-data"

export function useProducts(params?: { search?: string; category_id?: string; brand_id?: string; unit_id?: string }) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const result = await productService.getProducts({ ...params, limit: 1000 })
      let items = result.items
      if (params?.category_id) {
        items = items.filter((p: any) => p.category_id === params.category_id)
      }
      if (params?.brand_id) {
        items = items.filter((p: any) => p.brand_id === params.brand_id)
      }
      if (params?.unit_id) {
        items = items.filter((p: any) => p.unit_id === params.unit_id)
      }
      return items
    },
  })
}

export function useProduct(id: string | null) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => (id ? productService.getProduct(id) : null),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProductRequest) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) => productService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}
