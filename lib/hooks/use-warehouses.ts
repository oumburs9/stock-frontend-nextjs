"use client"

import type { AxiosError } from "axios"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { warehouseService } from "@/lib/services/warehouse.service"
import type {
  Warehouse,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
} from "@/lib/types/inventory"

export function useWarehouses() {
  return useQuery<Warehouse[], AxiosError>({
    queryKey: ["warehouses"],
    queryFn: () => warehouseService.getWarehouses({ limit: 1000 }),
  })
}

export function useWarehouse(id: string | null) {
  return useQuery<Warehouse | null, AxiosError>({
    queryKey: ["warehouses", id],
    queryFn: () => (id ? warehouseService.getWarehouse(id) : null),
    enabled: !!id,
  })
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient()

  return useMutation<Warehouse, AxiosError, CreateWarehouseRequest>({
    mutationFn: (data) => warehouseService.createWarehouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] })
    },
  })
}

export function useUpdateWarehouse() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, { id: string; data: UpdateWarehouseRequest }>({
    mutationFn: ({ id, data }) => warehouseService.updateWarehouse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] })
    },
  })
}

export function useDeleteWarehouse() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, string>({
    mutationFn: (id) => warehouseService.deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] })
    },
  })
}
