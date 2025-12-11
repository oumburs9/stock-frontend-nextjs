"use client"

import { useQuery } from "@tanstack/react-query"
import { stockService } from "@/lib/services/stock.service"

export function useStocks(params?: { warehouseId?: string; shopId?: string; search?: string }) {
  return useQuery({
    queryKey: ["stocks", params],
    queryFn: async () => {
      const stocks = await stockService.getStockSnapshot({
        warehouseId: params?.warehouseId,
        shopId: params?.shopId,
      })

      // Filter by search if provided
      if (params?.search) {
        return stocks.filter(
          (s) =>
            s.product.name.toLowerCase().includes(params.search!.toLowerCase()) ||
            s.product.sku.toLowerCase().includes(params.search!.toLowerCase()),
        )
      }

      return stocks
    },
  })
}

export function useStock(productId: string | null, locationId: string | null) {
  return useQuery({
    queryKey: ["stocks", productId, locationId],
    queryFn: () => (productId && locationId ? stockService.getAvailableStock(productId, locationId) : null),
    enabled: !!productId && !!locationId,
  })
}
