"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { shopService } from "@/lib/services/shop.service"
import type { CreateShopRequest, UpdateShopRequest } from "@/lib/types/inventory"

export function useShops() {
  return useQuery({
    queryKey: ["shops"],
    queryFn: () => shopService.getShops({ limit: 1000 }),
  })
}

export function useShop(id: string | null) {
  return useQuery({
    queryKey: ["shops", id],
    queryFn: () => (id ? shopService.getShop(id) : null),
    enabled: !!id,
  })
}

export function useCreateShop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateShopRequest) => shopService.createShop(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] })
    },
  })
}

export function useUpdateShop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShopRequest }) => shopService.updateShop(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] })
    },
  })
}

export function useDeleteShop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => shopService.deleteShop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] })
    },
  })
}
