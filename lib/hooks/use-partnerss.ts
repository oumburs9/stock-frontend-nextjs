"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { partnerService } from "@/lib/services/partner.service"
import type { CreatePartnerRequest, UpdatePartnerRequest } from "@/lib/types/master-data"

export function usePartners(type?: "supplier" | "customer") {
  return useQuery({
    queryKey: ["partners", type],
    queryFn: () => partnerService.getPartners(type, { limit: 1000 }),
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

  return useMutation({
    mutationFn: (data: CreatePartnerRequest) => partnerService.createPartner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] })
    },
  })
}

export function useUpdatePartner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartnerRequest }) => partnerService.updatePartner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] })
    },
  })
}

export function useDeletePartner() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => partnerService.deletePartner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners"] })
    },
  })
}
