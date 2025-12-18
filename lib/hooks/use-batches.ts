import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { batchService } from "@/lib/services/purchase.service"
import type { AddBatchExpenseRequest, CreateBatchExpenseAdjustmentRequest } from "@/lib/types/purchase"
import { toast } from "@/hooks/use-toast"

export function useBatches(params?: { product_id?: string }) {
  return useQuery({
    queryKey: ["batches", params],
    queryFn: async () => {
      const data = await batchService.getBatches(params)
      return Array.isArray(data) ? data : []
    },
    select: (data) => data || [],
  })
}

export function useGetBatch(id: string) {
  return useQuery({
    queryKey: ["batches", id],
    queryFn: () => batchService.getBatch(id),
    enabled: !!id,
  })
}

export function useBatch(id: string | null) {
  return useQuery({
    queryKey: ["batches", id],
    queryFn: () => (id ? batchService.getBatch(id) : null),
    enabled: !!id,
  })
}

export function useBatchesByProduct(productId: string | null) {
  return useQuery({
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

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddBatchExpenseRequest }) => batchService.addBatchExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] })
      toast({ title: "Batch expense added successfully" })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add batch expense",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      })
    },
  })
}

export function useAddBatchExpenseAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ expenseId, data }: { expenseId: string; data: CreateBatchExpenseAdjustmentRequest }) =>
      batchService.addBatchExpenseAdjustment(expenseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] })
      toast({ title: "Expense adjustment added successfully" })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add adjustment",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      })
    },
  })
}
