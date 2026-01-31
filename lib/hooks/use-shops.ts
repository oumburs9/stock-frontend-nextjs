"use client"

import type { AxiosError } from "axios"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { shopService } from "@/lib/services/shop.service"
import type {
  Shop,
  CreateShopRequest,
  UpdateShopRequest,
} from "@/lib/types/inventory"

export function useShops() {
  return useQuery<Shop[], AxiosError>({
    queryKey: ["shops"],
    queryFn: () => shopService.getShops({ limit: 1000 }),
  })
}

export function useShop(id: string | null) {
  return useQuery<Shop | null, AxiosError>({
    queryKey: ["shops", id],
    queryFn: () => (id ? shopService.getShop(id) : null),
    enabled: !!id,
  })
}

export function useCreateShop() {
  const queryClient = useQueryClient()

  return useMutation<Shop, AxiosError, CreateShopRequest>({
    mutationFn: (data) => shopService.createShop(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] })
    },
  })
}

export function useUpdateShop() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, { id: string; data: UpdateShopRequest }>({
    mutationFn: ({ id, data }) => shopService.updateShop(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] })
    },
  })
}

export function useDeleteShop() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, string>({
    mutationFn: (id) => shopService.deleteShop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] })
    },
  })
}
