import type { AxiosError } from "axios"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { shipmentService } from "@/lib/services/purchase.service"
import type {
  AddShipmentExpenseRequest,
  CreateShipmentExpenseAdjustmentRequest,
  CreateShipmentRequest,
  ReceiveShipmentRequest,
  UpdateShipmentRequest,
  PurchaseShipment,
  ShipmentExpenseAdjustment,
  ShipmentExpense,
} from "@/lib/types/purchase"

export function useShipments(params?: { q?: string; status?: string; type?: string }) {
  return useQuery<PurchaseShipment[], AxiosError>({
    queryKey: ["shipments", params],
    queryFn: async () => {
      const data = await shipmentService.getShipments(params)
      return Array.isArray(data) ? data : []
    },
    select: (data) => data || [],
  })
}

export function useShipment(id: string | null) {
  return useQuery<PurchaseShipment | null, AxiosError>({
    queryKey: ["shipments", id],
    queryFn: async () => {
      if (!id) return null
      return shipmentService.getShipment(id)
    },
    enabled: !!id,
  })
}

export function useCreateShipment() {
  const queryClient = useQueryClient()

  return useMutation<PurchaseShipment, AxiosError, CreateShipmentRequest>({
    mutationFn: (data) => shipmentService.createShipment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] })
    },
  })
}

export function useUpdateShipment() {
  const queryClient = useQueryClient()

  return useMutation<PurchaseShipment, AxiosError, { id: string; data: UpdateShipmentRequest }>({
    mutationFn: ({ id, data }) => shipmentService.updateShipment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] })
    },
  })
}

export function useAddShipmentExpense() {
  const queryClient = useQueryClient()

  return useMutation<ShipmentExpense, AxiosError, { id: string; data: AddShipmentExpenseRequest }>({
    mutationFn: ({ id, data }) => shipmentService.addShipmentExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] })
    },
  })
}

export function useReceiveShipment() {
  const queryClient = useQueryClient()

  return useMutation<any, AxiosError, { id: string; data: ReceiveShipmentRequest }>({
    mutationFn: ({ id, data }) => shipmentService.receiveShipment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] })
    },
  })
}

export function useCloseShipment() {
  const queryClient = useQueryClient()

  return useMutation<PurchaseShipment, AxiosError, string>({
    mutationFn: (id) => shipmentService.closeShipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] })
    },
  })
}

export function useAddShipmentExpenseAdjustment() {
  const queryClient = useQueryClient()

  return useMutation<ShipmentExpenseAdjustment, AxiosError, { expenseId: string; data: CreateShipmentExpenseAdjustmentRequest }>({
    mutationFn: ({ expenseId, data }) => shipmentService.addShipmentExpenseAdjustment(expenseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] })
    },
  })
}
