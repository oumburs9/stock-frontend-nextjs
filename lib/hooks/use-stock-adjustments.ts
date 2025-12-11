"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { stockService } from "@/lib/services/stock.service"
import type { CreateStockAdjustmentRequest, StockAdjustment } from "@/lib/types/inventory"

export function useStockAdjustments() {
  return useQuery({
    queryKey: ["stock-adjustments"],
    queryFn: async () => {
      const allTransactions = await stockService.getAdjustments()
      return allTransactions.filter((t) => t.relatedType === "adjustment") as StockAdjustment[]
    },
  })
}

export function useCreateStockAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStockAdjustmentRequest) => stockService.createAdjustment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-adjustments"] })
      queryClient.invalidateQueries({ queryKey: ["stock-transactions"] })
      queryClient.invalidateQueries({ queryKey: ["stocks"] })
    },
  })
}