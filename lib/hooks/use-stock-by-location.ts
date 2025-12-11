"use client"

import { useQuery } from "@tanstack/react-query"
import { stockService } from "@/lib/services/stock.service"
import type { StockSnapshot } from "@/lib/types/inventory"

interface Product extends StockSnapshot {
  onHand: number
  reserved: number
  available: number
}

export function useStockByLocation(locationType: "warehouse" | "shop", locationId: string | null) {
  return useQuery({
    queryKey: ["stock-by-location", locationType, locationId],
    queryFn: async (): Promise<Product[]> => {
      if (!locationId) return []

      const stocks = await stockService.getStockSnapshot(
        locationType === "warehouse" ? { warehouseId: locationId } : { shopId: locationId },
      )

      return stocks.map((s) => ({
        ...s,
        onHand: s.onHand || 0,
        reserved: s.reserved || 0,
        available: s.available || 0,
      }))
    },
    enabled: !!locationId,
  })
}
