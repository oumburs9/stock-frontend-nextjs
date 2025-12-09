"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { categoryService } from "@/lib/services/category.service"
import type { CreateCategoryRequest, UpdateCategoryRequest } from "@/lib/types/master-data"

export function useCategories(parentId?: string | null) {
  return useQuery({
    queryKey: ["categories", parentId],
    queryFn: async () => {
      const response = await categoryService.getCategories({ page: 1, limit: 1000 })
      return response.items
    },
  })
}

export function useCategory(id: string | null) {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: () => (id ? categoryService.getCategory(id) : null),
    enabled: !!id,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) => categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}
