"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { purchaseOrderService } from "@/lib/services/purchase.service"
import type {
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  ReceivePurchaseOrderRequest,
} from "@/lib/types/purchase"
import { toast } from "@/hooks/use-toast"

export function usePurchaseOrders(params?: { q?: string; status?: string }) {
  return useQuery({
    queryKey: ["purchase-orders", params],
    queryFn: async () => {
      const data = await purchaseOrderService.getPurchaseOrders(params)
      return Array.isArray(data) ? data : []
    },
    select: (data) => data || [],
  })
}

export function usePurchaseOrder(id: string | null) {
  return useQuery({
    queryKey: ["purchase-orders", id],
    queryFn: () => (id ? purchaseOrderService.getPurchaseOrder(id) : null),
    enabled: !!id,
  })
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePurchaseOrderRequest) => purchaseOrderService.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
      toast({ title: "Purchase order created successfully" })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create purchase order",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      })
    },
  })
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePurchaseOrderRequest }) =>
      purchaseOrderService.updatePurchaseOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
      toast({ title: "Purchase order updated successfully" })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update purchase order",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      })
    },
  })
}

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => purchaseOrderService.approvePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
      toast({ title: "Purchase order approved successfully" })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to approve purchase order",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      })
    },
  })
}

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => purchaseOrderService.cancelPurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
      toast({ title: "Purchase order cancelled successfully" })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to cancel purchase order",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      })
    },
  })
}

export function useReceivePurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReceivePurchaseOrderRequest }) =>
      purchaseOrderService.receivePurchaseOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] })
      queryClient.invalidateQueries({ queryKey: ["batches"] })
      toast({ title: "Purchase order received successfully" })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to receive purchase order",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      })
    },
  })
}
