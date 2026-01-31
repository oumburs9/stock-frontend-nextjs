"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { attributeService } from "@/lib/services/attribute.service"
import type { Attribute, CreateAttributeRequest, UpdateAttributeRequest } from "@/lib/types/master-data"

export function useAttributes() {
  return useQuery<Attribute[]>({
    queryKey: ["attributes"],
    queryFn: () => attributeService.getAttributes(),
  })
}

export function useCreateAttribute() {
  const queryClient = useQueryClient()

  return useMutation<Attribute, AxiosError, CreateAttributeRequest>({
    mutationFn: (data) => attributeService.createAttribute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] })
    },
  })
}

export function useUpdateAttribute() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, { id: string; data: UpdateAttributeRequest }>({
    mutationFn: ({ id, data }) => attributeService.updateAttribute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] })
    },
  })
}

export function useDeleteAttribute() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, string>({
    mutationFn: (id) => attributeService.deleteAttribute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attributes"] })
    },
  })
}
