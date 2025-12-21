"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
} from "@/lib/types/finance"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: IssueInvoiceRequest) => invoiceService.issueInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      queryClient.invalidateQueries({ queryKey: ["receivables"] })
      toast({
        title: "Success",
        description: "Invoice issued successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to issue invoice",
        variant: "destructive",
      })
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
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateReceivablePaymentRequest) => receivableService.createReceivablePayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receivables"] })
      queryClient.invalidateQueries({ queryKey: ["receivable-payments"] })
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to record payment",
        variant: "destructive",
      })
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
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreatePayableRequest) => payableService.createPayable(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] })
      toast({
        title: "Success",
        description: "Payable created successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create payable",
        variant: "destructive",
      })
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
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreatePayablePaymentRequest) => payableService.createPayablePayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payables"] })
      queryClient.invalidateQueries({ queryKey: ["payable-payments"] })
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to record payment",
        variant: "destructive",
      })
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
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: UpsertTaxConfigRequest) => taxService.upsertTaxConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-config"] })
      toast({
        title: "Success",
        description: "Tax configuration updated successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update tax configuration",
        variant: "destructive",
      })
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
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateTaxRuleRequest) => taxService.createTaxRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-rules"] })
      toast({
        title: "Success",
        description: "Tax rule created successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create tax rule",
        variant: "destructive",
      })
    },
  })
}

export function useUpdateTaxRule() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaxRuleRequest }) => taxService.updateTaxRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-rules"] })
      toast({
        title: "Success",
        description: "Tax rule updated successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update tax rule",
        variant: "destructive",
      })
    },
  })
}

export function useDeleteTaxRule() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (id: string) => taxService.deleteTaxRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-rules"] })
      toast({
        title: "Success",
        description: "Tax rule deleted successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete tax rule",
        variant: "destructive",
      })
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
  const { toast } = useToast()

  return useMutation({
    mutationFn: (invoiceId: string) => costingService.computeCosting(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costings"] })
      toast({
        title: "Success",
        description: "Costing computed successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to compute costing",
        variant: "destructive",
      })
    },
  })
}
