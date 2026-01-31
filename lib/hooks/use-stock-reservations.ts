import type { AxiosError } from "axios"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { stockService } from "@/lib/services/stock.service"
import type { StockReservation } from "@/lib/types/inventory"

type CreateStockReservationRequest = {
  productId: string
  salesOrderId: string
  quantity: string
  warehouseId?: string
  shopId?: string
}

export function useStockReservations() {
  return useQuery<StockReservation[], AxiosError>({
    queryKey: ["stock-reservations"],
    queryFn: async () => {
      const reservations = await stockService.getReservations()
      return reservations
    },
  })
}

export function useCreateStockReservation() {
  const queryClient = useQueryClient()

  return useMutation<StockReservation, AxiosError, CreateStockReservationRequest>({
    mutationFn: async (data) => {
      return await stockService.createReservation(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-reservations"] })
      queryClient.invalidateQueries({ queryKey: ["stocks"] })
    },
  })
}

export function useReleaseReservation() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, string>({
    mutationFn: async (id) => {
      await stockService.releaseReservation(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-reservations"] })
    },
  })
}

export function useConsumeReservation() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, string>({
    mutationFn: async (id) => {
      await stockService.consumeReservation(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-reservations"] })
      queryClient.invalidateQueries({ queryKey: ["stocks"] })
    },
  })
}
