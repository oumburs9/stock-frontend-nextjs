import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { pricingService, salesOrderService, stockReservationService } from "@/lib/services/sales.service"
import type {
  CreatePricingRuleRequest,
  UpdatePricingRuleRequest,
  CreateSalesOrderRequest,
  UpdateSalesOrderRequest,
  AddSalesOrderItemRequest,
  UpdateSalesOrderItemRequest,
  CreateReservationRequest,
} from "@/lib/types/sales"

// ===== PRICING HOOKS =====

export function usePricingRules() {
  return useQuery({
    queryKey: ["pricing-rules"],
    queryFn: () => pricingService.getPricingRules(),
  })
}

export function usePricingRule(id: string | null) {
  return useQuery({
    queryKey: ["pricing-rules", id],
    queryFn: () => pricingService.getPricingRule(id!),
    enabled: !!id,
  })
}

export function useCreatePricingRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePricingRuleRequest) => pricingService.createPricingRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-rules"] })
    },
  })
}

export function useUpdatePricingRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePricingRuleRequest }) =>
      pricingService.updatePricingRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-rules"] })
    },
  })
}

export function useDeletePricingRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => pricingService.deletePricingRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-rules"] })
    },
  })
}

export function usePriceQuote(productId: string | null, asOfDate?: string) {
  return useQuery({
    queryKey: ["price-quote", productId, asOfDate],
    queryFn: () => pricingService.quotePrice(productId!, asOfDate),
    enabled: !!productId,
  })
}

// ===== SALES ORDER HOOKS =====

export function useSalesOrders(params?: { q?: string; status?: string }) {
  return useQuery({
    queryKey: ["sales-orders", params],
    queryFn: () => salesOrderService.getSalesOrders(params),
  })
}

export function useSalesOrder(id: string | null) {
  return useQuery({
    queryKey: ["sales-orders", id],
    queryFn: () => salesOrderService.getSalesOrder(id!),
    enabled: !!id,
  })
}

export function useCreateSalesOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSalesOrderRequest) => salesOrderService.createSalesOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] })
    },
  })
}

export function useUpdateSalesOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSalesOrderRequest }) =>
      salesOrderService.updateSalesOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] })
      queryClient.invalidateQueries({ queryKey: ["sales-orders", variables.id] })
    },
  })
}

export function useAddSalesOrderItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: AddSalesOrderItemRequest }) =>
      salesOrderService.addSalesOrderItem(orderId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders", variables.orderId] })
    },
  })
}

export function useUpdateSalesOrderItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, itemId, data }: { orderId: string; itemId: string; data: UpdateSalesOrderItemRequest }) =>
      salesOrderService.updateSalesOrderItem(orderId, itemId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders", variables.orderId] })
    },
  })
}

export function useDeleteSalesOrderItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: string; itemId: string }) =>
      salesOrderService.deleteSalesOrderItem(orderId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders", variables.orderId] })
    },
  })
}

export function useConfirmSalesOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => salesOrderService.confirmSalesOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] })
      queryClient.invalidateQueries({ queryKey: ["sales-orders", id] })
    },
  })
}

export function useDeliverSalesOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => salesOrderService.deliverSalesOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] })
      queryClient.invalidateQueries({ queryKey: ["sales-orders", id] })
    },
  })
}

export function useCancelSalesOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => salesOrderService.cancelSalesOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["sales-orders"] })
      queryClient.invalidateQueries({ queryKey: ["sales-orders", id] })
    },
  })
}

// ===== RESERVATION HOOKS =====

export function useReservations(salesOrderId?: string) {
  return useQuery({
    queryKey: ["reservations", salesOrderId],
    queryFn: () => stockReservationService.getReservations(salesOrderId ? { salesOrderId } : undefined),
  })
}

export function useCreateReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateReservationRequest) => stockReservationService.createReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] })
    },
  })
}

export function useReleaseReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reservationId: string) => stockReservationService.releaseReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] })
    },
  })
}

export function useConsumeReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reservationId: string) => stockReservationService.consumeReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] })
    },
  })
}
