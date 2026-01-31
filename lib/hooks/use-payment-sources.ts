"use client"

import type { AxiosError } from "axios"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { paymentSourceService } from "../services/payment-source.service"
import type {
  CreatePaymentSourceRequest,
  UpdatePaymentSourceRequest,
  PaymentSource,
} from "@/lib/types/payment-source"

export function usePaymentSources() {
  return useQuery<PaymentSource[], AxiosError>({
    queryKey: ["payment-sources"],
    queryFn: () => paymentSourceService.getPaymentSources(),
  })
}

export function useActivePaymentSources() {
  return useQuery<PaymentSource[], AxiosError>({
    queryKey: ["payment-sources", "active"],
    queryFn: () => paymentSourceService.getActivePaymentSources(),
  })
}

export function usePaymentSource(id: string | null) {
  return useQuery<PaymentSource | null, AxiosError>({
    queryKey: ["payment-sources", id],
    queryFn: () => (id ? paymentSourceService.getPaymentSource(id) : null),
    enabled: !!id,
  })
}

export function useCreatePaymentSource() {
  const queryClient = useQueryClient()

  return useMutation<PaymentSource, AxiosError, CreatePaymentSourceRequest>({
    mutationFn: (data) => paymentSourceService.createPaymentSource(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-sources"] })
    },
  })
}

export function useUpdatePaymentSource() {
  const queryClient = useQueryClient()

  return useMutation<PaymentSource, AxiosError, { id: string; data: UpdatePaymentSourceRequest }>({
    mutationFn: ({ id, data }) => paymentSourceService.updatePaymentSource(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-sources"] })
    },
  })
}

export function useDeletePaymentSource() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, string>({
    mutationFn: (id) => paymentSourceService.deletePaymentSource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-sources"] })
    },
  })
}
