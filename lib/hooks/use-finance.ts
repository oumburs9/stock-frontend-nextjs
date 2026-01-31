"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosError } from "axios"
import {
  invoiceService,
  receivableService,
  payableService,
  taxService,
  costingService,
} from "@/lib/services/finance.service"
import type {
  IssueInvoiceRequest,
  CreateReceivablePaymentRequest,
  CreatePayableRequest,
  CreatePayablePaymentRequest,
  UpsertTaxConfigRequest,
  CreateTaxRuleRequest,
  UpdateTaxRuleRequest,
  InvoiceWithItems,
  Receivable,
  Payable,
  TaxConfig,
  TaxRule,
  Costing,
} from "@/lib/types/finance"

// ===== INVOICE HOOKS =====

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: () => invoiceService.getInvoices(),
    staleTime: 30000,
  })
}

export function useInvoice(id: string | null) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: () => invoiceService.getInvoice(id!),
    enabled: !!id,
  })
}

export function useIssueInvoice() {
  const queryClient = useQueryClient()

  return useMutation<InvoiceWithItems, AxiosError, IssueInvoiceRequest>({
    mutationFn: (data) => invoiceService.issueInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      queryClient.invalidateQueries({ queryKey: ["receivables"] })
    },
  })
}

// ===== RECEIVABLE HOOKS =====

export function useReceivables() {
  return useQuery({
    queryKey: ["receivables"],
    queryFn: () => receivableService.getReceivables(),
    staleTime: 30000,
  })
}

export function useReceivable(id: string | null) {
  return useQuery({
    queryKey: ["receivables", id],
    queryFn: () => receivableService.getReceivable(id!),
    enabled: !!id,
  })
}

export function useReceivablePayments(id: string | null) {
  return useQuery({
    queryKey: ["receivable-payments", id],
    queryFn: () => receivableService.getReceivablePayments(id!),
    enabled: !!id,
  })
}

export function useCreateReceivablePayment() {
  const queryClient = useQueryClient()

  return useMutation<Receivable, AxiosError, CreateReceivablePaymentRequest>({
    mutationFn: (data) => receivableService.createReceivablePayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivables"] })
      queryClient.invalidateQueries({ queryKey: ["receivable-payments"] })
    },
  })
}

// ===== PAYABLE HOOKS =====

export function usePayables() {
  return useQuery({
    queryKey: ["payables"],
    queryFn: () => payableService.getPayables(),
    staleTime: 30000,
  })
}

export function usePayable(id: string | null) {
  return useQuery({
    queryKey: ["payables", id],
    queryFn: () => payableService.getPayable(id!),
    enabled: !!id,
  })
}

export function useCreatePayable() {
  const queryClient = useQueryClient()

  return useMutation<Payable, AxiosError, CreatePayableRequest>({
    mutationFn: (data) => payableService.createPayable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] })
    },
  })
}

export function usePayablePayments(id: string | null) {
  return useQuery({
    queryKey: ["payable-payments", id],
    queryFn: () => payableService.getPayablePayments(id!),
    enabled: !!id,
  })
}

export function useCreatePayablePayment() {
  const queryClient = useQueryClient()

  return useMutation<Payable, AxiosError, CreatePayablePaymentRequest>({
    mutationFn: (data) => payableService.createPayablePayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] })
      queryClient.invalidateQueries({ queryKey: ["payable-payments"] })
    },
  })
}

// ===== TAX HOOKS =====

export function useTaxConfig() {
  return useQuery({
    queryKey: ["tax-config"],
    queryFn: () => taxService.getTaxConfig(),
    staleTime: 60000,
  })
}

export function useUpsertTaxConfig() {
  const queryClient = useQueryClient()

  return useMutation<TaxConfig, AxiosError, UpsertTaxConfigRequest>({
    mutationFn: (data) => taxService.upsertTaxConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-config"] })
    },
  })
}

export function useTaxRules() {
  return useQuery({
    queryKey: ["tax-rules"],
    queryFn: () => taxService.getTaxRules(),
    staleTime: 60000,
  })
}

export function useTaxRule(id: string | null) {
  return useQuery({
    queryKey: ["tax-rules", id],
    queryFn: () => taxService.getTaxRule(id!),
    enabled: !!id,
  })
}

export function useCreateTaxRule() {
  const queryClient = useQueryClient()

  return useMutation<TaxRule, AxiosError, CreateTaxRuleRequest>({
    mutationFn: (data) => taxService.createTaxRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-rules"] })
    },
  })
}

export function useUpdateTaxRule() {
  const queryClient = useQueryClient()

  return useMutation<TaxRule, AxiosError, { id: string; data: UpdateTaxRuleRequest }>({
    mutationFn: ({ id, data }) => taxService.updateTaxRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-rules"] })
    },
  })
}

export function useDeleteTaxRule() {
  const queryClient = useQueryClient()

  return useMutation<{ message: string }, AxiosError, string>({
    mutationFn: (id) => taxService.deleteTaxRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-rules"] })
    },
  })
}

// ===== COSTING HOOKS =====

export function useCostings() {
  return useQuery({
    queryKey: ["costings"],
    queryFn: () => costingService.getCostings(),
    staleTime: 30000,
  })
}

export function useCostingByInvoice(invoiceId: string | null) {
  return useQuery({
    queryKey: ["costings", "invoice", invoiceId],
    queryFn: () => costingService.getCostingByInvoice(invoiceId!),
    enabled: !!invoiceId,
  })
}

export function useComputeCosting() {
  const queryClient = useQueryClient()

  return useMutation<Costing, AxiosError, string>({
    mutationFn: (invoiceId) => costingService.computeCosting(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costings"] })
    },
  })
}
