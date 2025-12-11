"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { stockTransactionService } from "@/lib/services/stock-transaction.service"
import { stockService } from "@/lib/services/stock.service"
import type { CreateStockTransferRequest, CreateStockAdjustmentRequest } from "@/lib/types/inventory"

export function useStockTransactions(params?: {
  productId?: string
  warehouseId?: string
  shopId?: string
  direction?: string
  startDate?: string
  endDate?: string
}) {
  return useQuery({
    queryKey: ["stock-transactions", params],
    queryFn: () => stockTransactionService.getTransactions(params),
  })
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStockTransferRequest) => stockService.createTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-transactions"] })
      queryClient.invalidateQueries({ queryKey: ["stocks"] })
    },
  })
}

export function useCreateAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStockAdjustmentRequest) => stockService.createAdjustment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-transactions"] })
      queryClient.invalidateQueries({ queryKey: ["stocks"] })
    },
  })
}
