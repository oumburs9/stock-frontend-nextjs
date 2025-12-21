"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { paymentSourceService } from "../services/payment-source.service"
import type { CreatePaymentSourceRequest, UpdatePaymentSourceRequest } from "@/lib/types/payment-source"
import { useToast } from "@/hooks/use-toast"

export function usePaymentSources() {
  return useQuery({
    queryKey: ["payment-sources"],
    queryFn: () => paymentSourceService.getPaymentSources(),
  })
}

export function useActivePaymentSources() {
  return useQuery({
    queryKey: ["payment-sources", "active"],
    queryFn: () => paymentSourceService.getActivePaymentSources(),
  })
}

export function usePaymentSource(id: string | null) {
  return useQuery({
    queryKey: ["payment-sources", id],
    queryFn: () => (id ? paymentSourceService.getPaymentSource(id) : null),
    enabled: !!id,
  })
}

export function useCreatePaymentSource() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreatePaymentSourceRequest) => paymentSourceService.createPaymentSource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-sources"] })
      toast({
        title: "Payment source created",
        description: "The payment source has been created successfully.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export function useUpdatePaymentSource() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentSourceRequest }) =>
      paymentSourceService.updatePaymentSource(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-sources"] })
      toast({
        title: "Payment source updated",
        description: "The payment source has been updated successfully.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export function useDeletePaymentSource() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => paymentSourceService.deletePaymentSource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-sources"] })
      toast({
        title: "Payment source deleted",
        description: "The payment source has been deleted successfully.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}
