"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"

import { purchaseOrderService } from "@/lib/services/purchase.service"
import type {
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  ReceivePurchaseOrderRequest,
  PurchaseOrder,
} from "@/lib/types/purchase"

export function usePurchaseOrders(params?: { q?: string; status?: string }) {
  return useQuery<PurchaseOrder[], AxiosError>({
    queryKey: ["purchase-orders", params],
    queryFn: async () => {
      const data = await purchaseOrderService.getPurchaseOrders(params)
      return Array.isArray(data) ? data : []
    },
    select: (data) => data || [],
  })
}

export function usePurchaseOrder(id: string | null) {
  return useQuery<PurchaseOrder | null, AxiosError>({
    queryKey: ["purchase-orders", id],
    queryFn: () => (id ? purchaseOrderService.getPurchaseOrder(id) : null),
    enabled: !!id,
  })
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation<PurchaseOrder, AxiosError, CreatePurchaseOrderRequest>({
    mutationFn: (data) => purchaseOrderService.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
    },
  })
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation<
    PurchaseOrder,
    AxiosError,
    { id: string; data: UpdatePurchaseOrderRequest }
  >({
    mutationFn: ({ id, data }) =>
      purchaseOrderService.updatePurchaseOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
    },
  })
}

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation<PurchaseOrder, AxiosError, string>({
    mutationFn: (id) => purchaseOrderService.approvePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
    },
  })
}

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation<PurchaseOrder, AxiosError, string>({
    mutationFn: (id) => purchaseOrderService.cancelPurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
    },
  })
}

export function useReceivePurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation<
    unknown,
    AxiosError,
    { id: string; data: ReceivePurchaseOrderRequest }
  >({
    mutationFn: ({ id, data }) =>
      purchaseOrderService.receivePurchaseOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
      queryClient.invalidateQueries({ queryKey: ["batches"] })
    },
  })
}
