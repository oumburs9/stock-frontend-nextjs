"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { agentSalesService, commissionRulesService } from "@/lib/services/agent-sales.service"
import type {
  CreateCommissionRuleRequest,
  UpdateCommissionRuleRequest,
  CreateAgentSaleRequest,
  UpdateAgentSaleRequest,
  ConfirmAgentSaleRequest,
  IssueInvoiceRequest,
} from "@/lib/types/agent-sales"

// ===== COMMISSION RULES HOOKS =====

export function useCommissionRules() {
  return useQuery({
    queryKey: ["commission-rules"],
    queryFn: () => commissionRulesService.getCommissionRules(),
  })
}

export function useCommissionRule(id: string | null) {
  return useQuery({
    queryKey: ["commission-rules", id],
    queryFn: () => commissionRulesService.getCommissionRule(id!),
    enabled: !!id,
  })
}

export function useCreateCommissionRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCommissionRuleRequest) => commissionRulesService.createCommissionRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commission-rules"] })
    },
  })
}

export function useUpdateCommissionRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCommissionRuleRequest }) =>
      commissionRulesService.updateCommissionRule(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["commission-rules"] })
      queryClient.invalidateQueries({ queryKey: ["commission-rules", variables.id] })
    },
  })
}

export function useDeleteCommissionRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => commissionRulesService.deleteCommissionRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commission-rules"] })
    },
  })
}

// ===== AGENT SALES HOOKS =====

export function useAgentSales() {
  return useQuery({
    queryKey: ["agent-sales"],
    queryFn: () => agentSalesService.getAgentSales(),
  })
}

export function useAgentSale(id: string | null) {
  return useQuery({
    queryKey: ["agent-sales", id],
    queryFn: () => agentSalesService.getAgentSale(id!),
    enabled: !!id,
  })
}

export function useCreateAgentSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAgentSaleRequest) => agentSalesService.createAgentSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-sales"] })
    },
  })
}

export function useUpdateAgentSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAgentSaleRequest }) =>
      agentSalesService.updateAgentSale(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agent-sales"] })
      queryClient.invalidateQueries({ queryKey: ["agent-sales", variables.id] })
    },
  })
}

export function useConfirmAgentSale() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ConfirmAgentSaleRequest }) =>
      agentSalesService.confirmAgentSale(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agent-sales"] })
      queryClient.invalidateQueries({ queryKey: ["agent-sales", variables.id] })
    },
  })
}

export function useIssueAgentSaleInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IssueInvoiceRequest }) => agentSalesService.issueInvoice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agent-sales"] })
      queryClient.invalidateQueries({ queryKey: ["agent-sales", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      queryClient.invalidateQueries({ queryKey: ["receivables"] })
      queryClient.invalidateQueries({ queryKey: ["payables"] })
    },
  })
}
