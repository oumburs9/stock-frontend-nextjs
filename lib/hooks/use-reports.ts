import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  inventoryReportService,
  salesReportService,
  financeReportService,
  agentReportService,
} from "@/lib/services/report.service"
import type {
  StockPositionFilters,
  MovementFilters,
  InventoryMovementFilters,
  SalesSummaryFilters,
  PricingGovernanceFilters,
  FulfillmentFilters,
  ReceivablesFilters,
  PayablesFilters,
  CashflowFilters,
  ProfitabilityFilters,
  AgentPerformanceFilters,
  AgentSettlementFilters,
  ExportFormat,
} from "@/lib/types/report"

const STALE_TIME = 30000 // 30 seconds

// ============================================
// INVENTORY REPORTS HOOKS
// ============================================

export function useStockPositionReport(filters: StockPositionFilters) {
  return useQuery({
    queryKey: ["reports", "inventory", "stock-position", filters],
    queryFn: () => inventoryReportService.getStockPosition(filters),
    staleTime: STALE_TIME,
  })
}

export function useExportStockPosition() {
  return useMutation({
    mutationFn: ({
      filters,
      format,
    }: {
      filters: StockPositionFilters
      format: ExportFormat
    }) => inventoryReportService.exportStockPosition(filters, format),
    onSuccess: () => {
      toast.success("Report exported successfully")
    },
    onError: () => {
      toast.error("Failed to export report")
    },
  })
}

export function useInventoryMovementReport(filters: InventoryMovementFilters) {
  return useQuery({
    queryKey: ["reports", "inventory", "movement", filters],
    queryFn: () => inventoryReportService.getMovement(filters),
    staleTime: STALE_TIME,
  })
}

export function useMovementReport(filters: MovementFilters) {
  return useQuery({
    queryKey: ["reports", "inventory", "movement", filters],
    queryFn: () => inventoryReportService.getMovement(filters),
    staleTime: STALE_TIME,
  })
}

export function useExportMovement() {
  return useMutation({
    mutationFn: ({
      filters,
      format,
    }: {
      filters: MovementFilters
      format: ExportFormat
    }) => inventoryReportService.exportMovement(filters, format),
    onSuccess: () => {
      toast.success("Report exported successfully")
    },
    onError: () => {
      toast.error("Failed to export report")
    },
  })
}

// ============================================
// SALES REPORTS HOOKS
// ============================================

export function useSalesSummaryReport(filters: SalesSummaryFilters) {
  return useQuery({
    queryKey: ["reports", "sales", "summary", filters],
    queryFn: () => salesReportService.getSummary(filters),
    staleTime: STALE_TIME,
  })
}

export function useExportSalesSummary() {
  return useMutation({
    mutationFn: ({
      filters,
      format,
    }: {
      filters: SalesSummaryFilters
      format: ExportFormat
    }) => salesReportService.exportSummary(filters, format),
    onSuccess: () => {
      toast.success("Report exported successfully")
    },
    onError: () => {
      toast.error("Failed to export report")
    },
  })
}

export function usePricingGovernanceReport(filters: PricingGovernanceFilters) {
  return useQuery({
    queryKey: ["reports", "sales", "pricing-governance", filters],
    queryFn: () => salesReportService.getPricingGovernance(filters),
    staleTime: STALE_TIME,
  })
}

export function useExportPricingGovernance() {
  return useMutation({
    mutationFn: ({
      filters,
      format,
    }: {
      filters: PricingGovernanceFilters
      format: ExportFormat
    }) => salesReportService.exportPricingGovernance(filters, format),
    onSuccess: () => {
      toast.success("Report exported successfully")
    },
    onError: () => {
      toast.error("Failed to export report")
    },
  })
}

export function useFulfillmentReport(filters: FulfillmentFilters) {
  return useQuery({
    queryKey: ["reports", "sales", "fulfillment", filters],
    queryFn: () => salesReportService.getFulfillment(filters),
    staleTime: STALE_TIME,
  })
}

export function useExportFulfillment() {
  return useMutation({
    mutationFn: ({
      filters,
      format,
    }: {
      filters: FulfillmentFilters
      format: ExportFormat
    }) => salesReportService.exportFulfillment(filters, format),
    onSuccess: () => {
      toast.success("Report exported successfully")
    },
    onError: () => {
      toast.error("Failed to export report")
    },
  })
}

// ============================================
// FINANCE REPORTS HOOKS
// ============================================

export function useReceivablesReport(filters: ReceivablesFilters) {
  return useQuery({
    queryKey: ["reports", "finance", "receivables", filters],
    queryFn: () => financeReportService.getReceivables(filters),
    staleTime: STALE_TIME,
  })
}

export function useExportReceivables() {
  return useMutation({
    mutationFn: ({
      filters,
      format,
    }: {
      filters: ReceivablesFilters
      format: ExportFormat
    }) => financeReportService.exportReceivables(filters, format),
    onSuccess: () => {
      toast.success("Report exported successfully")
    },
    onError: () => {
      toast.error("Failed to export report")
    },
  })
}

export function usePayablesReport(filters: PayablesFilters) {
  return useQuery({
    queryKey: ["reports", "finance", "payables", filters],
    queryFn: () => financeReportService.getPayables(filters),
    staleTime: STALE_TIME,
  })
}

export function useExportPayables() {
  return useMutation({
    mutationFn: ({
      filters,
      format,
    }: {
      filters: PayablesFilters
      format: ExportFormat
    }) => financeReportService.exportPayables(filters, format),
    onSuccess: () => {
      toast.success("Report exported successfully")
    },
    onError: () => {
      toast.error("Failed to export report")
    },
  })
}

export function useCashflowReport(filters: CashflowFilters) {
  return useQuery({
    queryKey: ["reports", "finance", "cashflow", filters],
    queryFn: () => financeReportService.getCashflow(filters),
    staleTime: STALE_TIME,
  })
}

export function useExportCashflow() {
  return useMutation({
    mutationFn: ({
      filters,
      format,
    }: {
      filters: CashflowFilters
      format: ExportFormat
    }) => financeReportService.exportCashflow(filters, format),
    onSuccess: () => {
      toast.success("Report exported successfully")
    },
    onError: () => {
      toast.error("Failed to export report")
    },
  })
}

export function useProfitabilityReport(filters: ProfitabilityFilters) {
  return useQuery({
    queryKey: ["reports", "finance", "profitability", filters],
    queryFn: () => financeReportService.getProfitability(filters),
    staleTime: STALE_TIME,
  })
}

export function useExportProfitability() {
  return useMutation({
    mutationFn: ({
      filters,
      format,
    }: {
      filters: ProfitabilityFilters
      format: ExportFormat
    }) => financeReportService.exportProfitability(filters, format),
    onSuccess: () => {
      toast.success("Report exported successfully")
    },
    onError: () => {
      toast.error("Failed to export report")
    },
  })
}

// ============================================
// AGENT REPORTS HOOKS
// ============================================

export function useAgentPerformanceReport(filters: AgentPerformanceFilters) {
  return useQuery({
    queryKey: ["reports", "agent", "performance", filters],
    queryFn: () => agentReportService.getPerformance(filters),
    staleTime: STALE_TIME,
  })
}

export function useExportAgentPerformance() {
  return useMutation({
    mutationFn: ({
      filters,
      format,
    }: {
      filters: AgentPerformanceFilters
      format: ExportFormat
    }) => agentReportService.exportPerformance(filters, format),
    onSuccess: () => {
      toast.success("Report exported successfully")
    },
    onError: () => {
      toast.error("Failed to export report")
    },
  })
}

export function useAgentSettlementsReport(filters: AgentSettlementFilters) {
  return useQuery({
    queryKey: ["reports", "agent", "settlements", filters],
    queryFn: () => agentReportService.getSettlements(filters),
    staleTime: STALE_TIME,
  })
}

export function useExportAgentSettlements() {
  return useMutation({
    mutationFn: ({
      filters,
      format,
    }: {
      filters: AgentSettlementFilters
      format: ExportFormat
    }) => agentReportService.exportSettlements(filters, format),
    onSuccess: () => {
      toast.success("Report exported successfully")
    },
    onError: () => {
      toast.error("Failed to export report")
    },
  })
}
