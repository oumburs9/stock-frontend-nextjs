"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { brandService } from "@/lib/services/brand.service"
import type { CreateBrandRequest, UpdateBrandRequest } from "@/lib/types/master-data"

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => brandService.getBrands({ limit: 1000 }),
    select: (data) => data.items,
  })
}

export function useBrand(id: string | null) {
  return useQuery({
    queryKey: ["brands", id],
    queryFn: () => (id ? brandService.getBrand(id) : null),
    enabled: !!id,
  })
}

export function useCreateBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBrandRequest) => brandService.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
    },
  })
}

export function useUpdateBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandRequest }) => brandService.updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
    },
  })
}

export function useDeleteBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => brandService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
    },
  })
}
