"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { stockService } from "@/lib/services/stock.service"

export function useStockReservations() {
  return useQuery({
    queryKey: ["stock-reservations"],
    queryFn: async () => {
      const reservations = await stockService.getReservations()
      return reservations
    },
  })
}

export function useCreateStockReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      productId: string
      salesOrderId: string
      quantity: string
      warehouseId?: string
      shopId?: string
    }) => {
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

  return useMutation({
    mutationFn: async (id: string) => {
      await stockService.releaseReservation(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-reservations"] })
    },
  })
}

export function useConsumeReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await stockService.consumeReservation(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-reservations"] })
      queryClient.invalidateQueries({ queryKey: ["stocks"] })
    },
  })
}
