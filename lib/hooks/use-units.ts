"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { unitService } from "@/lib/services/unit.service"
import type { CreateUnitRequest, UpdateUnitRequest } from "@/lib/types/master-data"

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

  return useMutation({
    mutationFn: (data: CreateUnitRequest) => unitService.createUnit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] })
    },
  })
}

export function useUpdateUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUnitRequest }) => unitService.updateUnit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] })
    },
  })
}

export function useDeleteUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => unitService.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] })
    },
  })
}
