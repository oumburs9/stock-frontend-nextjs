"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"

import { expenseTypeService } from "@/lib/services/purchase.service"
import type {
  CreateExpenseTypeRequest,
  UpdateExpenseTypeRequest,
  ExpenseType,
} from "@/lib/types/purchase"

export function useExpenseTypes(params?: {
  q?: string
  scope?: "shipment" | "batch"
  active?: boolean
}) {
  return useQuery<ExpenseType[], AxiosError>({
    queryKey: ["expense-types", params],
    queryFn: async () => {
      const data = await expenseTypeService.getExpenseTypes(params)
      return Array.isArray(data) ? data : []
    },
    select: (data) => data || [],
  })
}

export function useExpenseType(id: string | null) {
  return useQuery<ExpenseType | null, AxiosError>({
    queryKey: ["expense-types", id],
    queryFn: () => (id ? expenseTypeService.getExpenseType(id) : null),
    enabled: !!id,
  })
}

export function useCreateExpenseType() {
  const queryClient = useQueryClient()

  return useMutation<ExpenseType, AxiosError, CreateExpenseTypeRequest>({
    mutationFn: (data) => expenseTypeService.createExpenseType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-types"] })
    },
  })
}

export function useUpdateExpenseType() {
  const queryClient = useQueryClient()

  return useMutation<
    ExpenseType,
    AxiosError,
    { id: string; data: UpdateExpenseTypeRequest }
  >({
    mutationFn: ({ id, data }) =>
      expenseTypeService.updateExpenseType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-types"] })
    },
  })
}

export function useDeleteExpenseType() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, string>({
    mutationFn: (id) => expenseTypeService.deleteExpenseType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-types"] })
    },
  })
}
