import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { shipmentService } from "@/lib/services/purchase.service"
import type {
  CreateShipmentRequest,
  UpdateShipmentRequest,
  AddShipmentExpenseRequest,
  ReceiveShipmentRequest,
  CreateShipmentExpenseAdjustmentRequest,
} from "@/lib/types/purchase"
import { toast } from "@/hooks/use-toast"

export function useShipments(params?: { q?: string; status?: string; type?: string }) {
  return useQuery({
    queryKey: ["shipments", params],
    queryFn: async () => {
      const data = await shipmentService.getShipments(params)
      return Array.isArray(data) ? data : []
    },
    select: (data) => data || [],
  })
}

export function useShipment(id: string | null) {
  return useQuery({
    queryKey: ["shipments", id],
    queryFn: async () => {
      if (!id) return null
      const data = await shipmentService.getShipment(id)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateShipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateShipmentRequest) => shipmentService.createShipment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] })
      toast({ title: "Shipment created successfully" })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create shipment",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      })
    },
  })
}

export function useUpdateShipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShipmentRequest }) => shipmentService.updateShipment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] })
      toast({ title: "Shipment updated successfully" })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update shipment",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      })
    },
  })
}

export function useAddShipmentExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddShipmentExpenseRequest }) =>
      shipmentService.addShipmentExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] })
      toast({ title: "Expense added successfully" })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add expense",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      })
    },
  })
}

export function useReceiveShipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReceiveShipmentRequest }) =>
      shipmentService.receiveShipment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] })
      toast({ title: "Shipment received successfully" })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to receive shipment",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      })
    },
  })
}

export function useCloseShipment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => shipmentService.closeShipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] })
      toast({ title: "Shipment closed successfully" })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to close shipment",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      })
    },
  })
}

export function useAddShipmentExpenseAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ expenseId, data }: { expenseId: string; data: CreateShipmentExpenseAdjustmentRequest }) =>
      shipmentService.addShipmentExpenseAdjustment(expenseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipments"] })
      toast({ title: "Expense adjustment added successfully" })
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add adjustment",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      })
    },
  })
}
