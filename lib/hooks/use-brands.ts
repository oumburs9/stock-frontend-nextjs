"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { brandService } from "@/lib/services/brand.service"
import type { Brand, CreateBrandRequest, UpdateBrandRequest } from "@/lib/types/master-data"

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

  return useMutation<Brand, AxiosError, CreateBrandRequest>({
    mutationFn: (data) => brandService.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
    },
  })
}

export function useUpdateBrand() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, { id: string; data: UpdateBrandRequest }>({
    mutationFn: ({ id, data }) => brandService.updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
    },
  })
}

export function useDeleteBrand() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, string>({
    mutationFn: (id) => brandService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] })
    },
  })
}
