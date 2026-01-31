"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { stockService } from "@/lib/services/stock.service"
import type { CreateStockTransferRequest, StockTransfer } from "@/lib/types/inventory"


export function useStockTransfers() {
  return useQuery({
    queryKey: ["stock-transfers"],
    queryFn: () => stockService.getTransfers(),
  })
}

export function useCreateStockTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStockTransferRequest) => stockService.createTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] })
      queryClient.invalidateQueries({ queryKey: ["stocks"] })
    },
  })
}
