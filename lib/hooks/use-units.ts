"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { unitService } from "@/lib/services/unit.service"
import type { CreateUnitRequest, Unit, UpdateUnitRequest } from "@/lib/types/master-data"

export function useUnits() {
  return useQuery({
    queryKey: ["units"],
    queryFn: () => unitService.getUnits({ limit: 1000 }),
    select: (data) => data.items,
  })
}

export function useUnit(id: string | null) {
  return useQuery({
    queryKey: ["units", id],
    queryFn: () => (id ? unitService.getUnit(id) : null),
    enabled: !!id,
  })
}

export function useCreateUnit() {
  const queryClient = useQueryClient()

  return useMutation<Unit, AxiosError, CreateUnitRequest>({
    mutationFn: (data) => unitService.createUnit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] })
    },
  })
}

export function useUpdateUnit() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, { id: string; data: UpdateUnitRequest }>({
    mutationFn: ({ id, data }) => unitService.updateUnit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] })
    },
  })
}

export function useDeleteUnit() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, string>({
    mutationFn: (id) => unitService.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] })
    },
  })
}
