"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { attributeService } from "@/lib/services/attribute.service"
import type { CreateAttributeRequest, UpdateAttributeRequest } from "@/lib/types/master-data"

export function useAttributes() {
  return useQuery({
    queryKey: ["attributes"],
    queryFn: () => attributeService.getAttributes(),
  })
}

export function useAttribute(id: string | null) {
  return useQuery({
    queryKey: ["attributes", id],
    queryFn: () => (id ? attributeService.getAttribute(id) : null),
    enabled: !!id,
  })
}

export function useCreateAttribute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAttributeRequest) => attributeService.createAttribute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] })
    },
  })
}

export function useUpdateAttribute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAttributeRequest }) =>
      attributeService.updateAttribute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] })
    },
  })
}

export function useDeleteAttribute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => attributeService.deleteAttribute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] })
    },
  })
}
