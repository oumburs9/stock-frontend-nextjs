"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { stockService } from "@/lib/services/stock.service"
import type { CreateStockTransferRequest, StockTransfer } from "@/lib/types/inventory"

const MOCK_TRANSFERS: StockTransfer[] = [
  {
    id: "transfer-1",
    product: { id: "1", name: 'MacBook Pro 16"' },
    fromWarehouse: {
      id: "3b0af3c9-d927-4b41-8a17-f83b152b1f1e",
      name: "Addis Central Warehouse",
      address: "Bole, Addis Ababa",
      description: "Main distribution hub",
    },
    toShop: {
      id: "fc845e2f-556e-4a94-b67f-3e3b7ec8c234",
      name: "Piassa Retail Shop",
      address: "Piassa, Addis Ababa",
      description: "High-traffic retail branch",
    },
    quantity: "5",
    direction: "transfer",
    reason: "replenish_retail_stock",
    createdAt: "2025-12-10T06:15:45.182Z",
  },
]

export function useStockTransfers() {
  return useQuery({
    queryKey: ["stock-transfers"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return MOCK_TRANSFERS
    },
  })
}

export function useCreateStockTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateStockTransferRequest) => {
      const transfer = await stockService.createTransfer(data)
      MOCK_TRANSFERS.push(transfer)
      return transfer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-transfers"] })
      queryClient.invalidateQueries({ queryKey: ["stocks"] })
    },
  })
}
