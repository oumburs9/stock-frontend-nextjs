"use client"

import type { AxiosError } from "axios"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { categoryService } from "@/lib/services/category.service"
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/lib/types/master-data"

/**
 * Categories list
 * NOTE: parentId is part of the cache key only.
 * Current backend endpoint does not filter by parent.
 */
export function useCategories(parentId?: string | null) {
  return useQuery<Category[], AxiosError>({
    queryKey: ["categories", parentId],
    queryFn: async () => {
      const response = await categoryService.getCategories({ page: 1, limit: 1000 })
      return response.items ?? []
    },
  })
}

export function useCategory(id: string | null) {
  return useQuery<Category | null, AxiosError>({
    queryKey: ["categories", id],
    queryFn: () => (id ? categoryService.getCategory(id) : null),
    enabled: !!id,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation<Category, AxiosError, CreateCategoryRequest>({
    mutationFn: (data) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, { id: string; data: UpdateCategoryRequest }>({
    mutationFn: ({ id, data }) => categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, string>({
    mutationFn: (id) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}
