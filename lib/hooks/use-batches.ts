"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"

import { batchService } from "@/lib/services/purchase.service"
import type {
  AddBatchExpenseRequest,
  CreateBatchExpenseAdjustmentRequest,
  Batch,
  BatchExpenseAdjustment,
  BatchExpense,
} from "@/lib/types/purchase"

export function useBatches(params?: { product_id?: string }) {
  return useQuery<Batch[], AxiosError>({
    queryKey: ["batches", params],
    queryFn: async () => {
      const data = await batchService.getBatches(params)
      return Array.isArray(data) ? data : []
    },
    select: (data) => data || [],
  })
}

export function useGetBatch(id: string) {
  return useQuery<Batch, AxiosError>({
    queryKey: ["batches", id],
    queryFn: () => batchService.getBatch(id),
    enabled: !!id,
  })
}

export function useBatch(id: string | null) {
  return useQuery<Batch | null, AxiosError>({
    queryKey: ["batches", id],
    queryFn: () => (id ? batchService.getBatch(id) : null),
    enabled: !!id,
  })
}

export function useBatchesByProduct(productId: string | null) {
  return useQuery<Batch[], AxiosError>({
    queryKey: ["batches", "product", productId],
    queryFn: async () => {
      if (!productId) return []
      const data = await batchService.getBatchesByProduct(productId)
      return Array.isArray(data) ? data : []
    },
    enabled: !!productId,
    select: (data) => data || [],
  })
}

export function useAddBatchExpense() {
  const queryClient = useQueryClient()

  return useMutation<
    BatchExpense,
    AxiosError,
    { id: string; data: AddBatchExpenseRequest }
  >({
    mutationFn: ({ id, data }) =>
      batchService.addBatchExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] })
    },
  })
}

export function useAddBatchExpenseAdjustment() {
  const queryClient = useQueryClient()

  return useMutation<
    BatchExpenseAdjustment,
    AxiosError,
    { expenseId: string; data: CreateBatchExpenseAdjustmentRequest }
  >({
    mutationFn: ({ expenseId, data }) =>
      batchService.addBatchExpenseAdjustment(expenseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] })
    },
  })
}
