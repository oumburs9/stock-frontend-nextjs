"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { warehouseService } from "@/lib/services/warehouse.service"
import type { CreateWarehouseRequest, UpdateWarehouseRequest } from "@/lib/types/inventory"

export function useWarehouses() {
  return useQuery({
    queryKey: ["warehouses"],
    queryFn: () => warehouseService.getWarehouses({ limit: 1000 }),
  })
}

export function useWarehouse(id: string | null) {
  return useQuery({
    queryKey: ["warehouses", id],
    queryFn: () => (id ? warehouseService.getWarehouse(id) : null),
    enabled: !!id,
  })
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWarehouseRequest) => warehouseService.createWarehouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] })
    },
  })
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWarehouseRequest }) =>
      warehouseService.updateWarehouse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] })
    },
  })
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => warehouseService.deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] })
    },
  })
}
