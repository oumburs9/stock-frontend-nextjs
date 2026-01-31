"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import { partnerService } from "@/lib/services/partner.service"
import type { CreatePartnerRequest, Partner, UpdatePartnerRequest } from "@/lib/types/master-data"

export function usePartners(type?: "supplier" | "customer") {
  return useQuery({
    queryKey: ["partners", type],
    queryFn: () => {
      const params: any = { limit: 1000 }
      if (type === "supplier") {
        params.is_supplier = true
      } else if (type === "customer") {
        params.is_customer = true
      }
      return partnerService.getPartners(params)
    },
    select: (data) => data.items,
  })
}

export function usePartner(id: string | null) {
  return useQuery({
    queryKey: ["partners", id],
    queryFn: () => (id ? partnerService.getPartner(id) : null),
    enabled: !!id,
  })
}

export function useCreatePartner() {
  const queryClient = useQueryClient()

  return useMutation<Partner, AxiosError, CreatePartnerRequest>({
    mutationFn: (data) => partnerService.createPartner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] })
    },
  })
}

export function useUpdatePartner() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, { id: string; data: UpdatePartnerRequest }>({
    mutationFn: ({ id, data }) => partnerService.updatePartner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] })
    },
  })
}

export function useDeletePartner() {
  const queryClient = useQueryClient()

  return useMutation<void, AxiosError, string>({
    mutationFn: (id) => partnerService.deletePartner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] })
    },
  })
}
