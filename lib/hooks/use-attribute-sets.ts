"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { attributeSetService } from "@/lib/services/attribute-set.service"
import type {
  CreateAttributeSetRequest,
  UpdateAttributeSetRequest,
  CreateSetItemRequest,
  AttributeSet,
  SetItem,
} from "@/lib/types/master-data"

// Get all attribute sets
export function useAttributeSets() {
  return useQuery({
    queryKey: ["attribute-sets"],
    queryFn: () => attributeSetService.getAttributeSets({ limit: 1000 }),
    select: (data) => data.items,
  })
}

// Get single attribute set
export function useAttributeSet(id: string) {
  return useQuery({
    queryKey: ["attribute-sets", id],
    queryFn: () => attributeSetService.getAttributeSet(id),
    enabled: !!id,
  })
}

// Create attribute set
export function useCreateAttributeSet() {
  const queryClient = useQueryClient()

  return useMutation<AttributeSet, AxiosError, CreateAttributeSetRequest>({
    mutationFn: (data) => attributeSetService.createAttributeSet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attribute-sets"] })
    },
  })
}

// Update attribute set
export function useUpdateAttributeSet() {
  const queryClient = useQueryClient()

  return useMutation<
    AttributeSet,
    AxiosError,
    { id: string; data: UpdateAttributeSetRequest }
  >({
    mutationFn: ({ id, data }) =>
      attributeSetService.updateAttributeSet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attribute-sets"] })
    },
  })
}

// Delete attribute set
export function useDeleteAttributeSet() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, string>({
    mutationFn: (id) => attributeSetService.deleteAttributeSet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attribute-sets"] })
    },
  })
}

// Get set items
export function useSetItems(setId: string) {
  return useQuery({
    queryKey: ["attribute-sets", setId, "items"],
    queryFn: () => attributeSetService.getSetItems(setId),
    enabled: !!setId,
  })
}

// Add item to set
export function useAddSetItem(setId: string) {
  const queryClient = useQueryClient()

  return useMutation<SetItem, AxiosError, CreateSetItemRequest>({
    mutationFn: (data) => attributeSetService.addSetItem(setId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attribute-sets", setId, "items"] })
      queryClient.invalidateQueries({ queryKey: ["attribute-sets", setId] })
      queryClient.invalidateQueries({ queryKey: ["attribute-sets"] })
    },
  })
}

// Remove item from set
export function useRemoveSetItem(setId: string) {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, string>({
    mutationFn: (itemId) => attributeSetService.removeSetItem(setId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attribute-sets", setId, "items"] })
      queryClient.invalidateQueries({ queryKey: ["attribute-sets", setId] })
      queryClient.invalidateQueries({ queryKey: ["attribute-sets"] })
    },
  })
}

// Update item sort order
export function useUpdateSetItemOrder(setId: string) {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, { itemId: string; sortOrder: number }>({
    mutationFn: ({ itemId, sortOrder }) =>
      attributeSetService.updateSetItemOrder(setId, itemId, sortOrder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attribute-sets", setId, "items"] })
    },
  })
}

// Bulk add items to set
export function useBulkAddSetItems(setId: string) {
  const queryClient = useQueryClient()

  return useMutation<SetItem[], AxiosError, string[]>({
    mutationFn: (attributeIds) =>
      attributeSetService.bulkAddSetItems(setId, attributeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attribute-sets", setId, "items"] })
      queryClient.invalidateQueries({ queryKey: ["attribute-sets", setId] })
      queryClient.invalidateQueries({ queryKey: ["attribute-sets"] })
    },
  })
}

// Bulk remove items from set
export function useBulkRemoveSetItems(setId: string) {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, string[]>({
    mutationFn: (itemIds) =>
      attributeSetService.bulkRemoveSetItems(setId, itemIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attribute-sets", setId, "items"] })
      queryClient.invalidateQueries({ queryKey: ["attribute-sets", setId] })
      queryClient.invalidateQueries({ queryKey: ["attribute-sets"] })
    },
  })
}
