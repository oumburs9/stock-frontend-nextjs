// Report Type Definitions - Frozen API Contract

// Common types
export type ExportFormat = "csv" | "excel" | "pdf"

export interface ReportFilters {
  fromDate?: string // ISO 8601 format
  toDate?: string // ISO 8601 format
}

export type DateRangeFilters = ReportFilters
export type InventoryMovementFilters = MovementFilters

// ============================================
// INVENTORY REPORTS
// ============================================

export interface StockPositionFilters {
  productId?: string // uuid
  warehouseId?: string // uuid
  shopId?: string // uuid
}

export interface StockPositionReport {
  product_id: string // uuid
  product_name: string
  warehouse_id: string | null // uuid
  shop_id: string | null // uuid
  on_hand_qty: string // decimal as string
  reserved_qty: string // decimal as string
  available_qty: string // decimal as string
}

export interface MovementFilters {
  fromDate?: string // ISO date YYYY-MM-DD
  toDate?: string // ISO date YYYY-MM-DD
}

export interface MovementReport {
  product_id: string // uuid
  movement_date: string // YYYY-MM-DD
  qty_in: string // decimal as string
  qty_out: string // decimal as string
}

// ============================================
// SALES REPORTS
// ============================================

export interface SalesSummaryFilters {
  fromDate?: string // ISO date YYYY-MM-DD
  toDate?: string // ISO date YYYY-MM-DD
  status?: "draft" | "confirmed" | "reserved" | "partially_delivered" | "delivered" | "cancelled"
}

export interface SalesSummaryReport {
  order_date: string // YYYY-MM-DD
  orders_count: number
  total_quantity: string // decimal as string
  total_sales: string // decimal as string
}

export type PricingGovernanceFilters = {}

export interface PricingGovernanceReport {
  total_items: number
  rule_used_count: number
  discounted_items: number
  avg_discount_percent: string // decimal as string
}

export type FulfillmentFilters = {}

export interface FulfillmentReport {
  status: "draft" | "confirmed" | "reserved" | "partially_delivered" | "delivered" | "cancelled"
  order_count: number
}

// ============================================
// FINANCE REPORTS
// ============================================

export type ReceivablesFilters = {}

export interface ReceivablesReport {
  id: string // uuid
  partner_id: string // uuid
  amount: string // decimal as string
  balance: string // decimal as string
  due_date: string // YYYY-MM-DD
  overdue_days: number
  status: "open" | "partially_paid" | "paid" | "overdue"
}

export type PayablesFilters = {}

export interface PayablesReport {
  id: string // uuid
  supplier_id: string // uuid
  amount: string // decimal as string
  balance: string // decimal as string
  due_date: string // YYYY-MM-DD
  overdue_days: number
  status: "open" | "partially_paid" | "paid" | "overdue"
}

export type CashflowFilters = {}

export interface CashflowReport {
  payment_date: string // YYYY-MM-DD
  inflow: string // decimal as string
}

export type ProfitabilityFilters = {}

export interface ProfitabilityReport {
  revenue: string // decimal as string
  cogs: string // decimal as string (cost of goods sold)
  profit: string // decimal as string
  avg_margin: string // decimal as string (percentage)
}

// ============================================
// AGENT REPORTS
// ============================================

export type AgentPerformanceFilters = {}

export interface AgentPerformanceReport {
  sales_count: number
  gross_sales: string // decimal as string
  commission_earned: string // decimal as string
  principal_payable: string // decimal as string
}

export type AgentSettlementFilters = {}

export interface AgentSettlementReport {
  status: "draft" | "confirmed" | "invoiced" | "cancelled"
  count: number
  total_amount: string // decimal as string
}

// ============================================
// UTILITY TYPES
// ============================================

export interface ReportExportRequest {
  format: ExportFormat
  filters?: Record<string, any>
}

export interface ReportMetadata {
  title: string
  description: string
  endpoint: string
  permissions: string[]
  hasExport: boolean
  category: "inventory" | "sales" | "finance" | "agent"
}
