import { axiosInstance } from "@/lib/api/axios-instance"
import type {
  StockPositionFilters,
  StockPositionReport,
  MovementFilters,
  MovementReport,
  SalesSummaryFilters,
  SalesSummaryReport,
  PricingGovernanceFilters,
  PricingGovernanceReport,
  FulfillmentFilters,
  FulfillmentReport,
  ReceivablesFilters,
  ReceivablesReport,
  PayablesFilters,
  PayablesReport,
  CashflowFilters,
  CashflowReport,
  ProfitabilityFilters,
  ProfitabilityReport,
  AgentPerformanceFilters,
  AgentPerformanceReport,
  AgentSettlementFilters,
  AgentSettlementReport,
  ExportFormat,
} from "@/lib/types/report"

const USE_MOCK_DATA = false

const BASE_URL = "/reports"

// ============================================
// MOCK DATA - Matching Frozen API Contract EXACTLY
// ============================================

const mockStockPosition: StockPositionReport[] = [
  {
    product_id: "a3d7b8ea-7d4d-4cdd-8c4a-1f5c8c3f3b20",
    product_name: "Paracetamol 500mg",
    warehouse_id: "5c42d0aa-2d1d-4d3a-8c7a-3a1e8b74fd12",
    shop_id: null,
    on_hand_qty: "120.0000",
    reserved_qty: "10.0000",
    available_qty: "110.0000",
  },
  {
    product_id: "b4e8c9fb-8e5e-5dee-9d5b-2g6d9d4g4c31",
    product_name: "Amoxicillin 250mg",
    warehouse_id: "5c42d0aa-2d1d-4d3a-8c7a-3a1e8b74fd12",
    shop_id: null,
    on_hand_qty: "85.0000",
    reserved_qty: "5.0000",
    available_qty: "80.0000",
  },
  {
    product_id: "c5f9d0gc-9f6f-6eff-0e6c-3h7e0e5h5d42",
    product_name: "Ibuprofen 400mg",
    warehouse_id: null,
    shop_id: "6d53e1bb-3e2e-5e4b-9d8b-4b2f9c85ge23",
    on_hand_qty: "5.0000",
    reserved_qty: "0.0000",
    available_qty: "5.0000",
  },
  {
    product_id: "d6g0e1hd-0g7g-7fgg-1f7d-4i8f1f6i6e53",
    product_name: "Aspirin 100mg",
    warehouse_id: "5c42d0aa-2d1d-4d3a-8c7a-3a1e8b74fd12",
    shop_id: null,
    on_hand_qty: "200.0000",
    reserved_qty: "20.0000",
    available_qty: "180.0000",
  },
]

const mockMovementReport: MovementReport[] = [
  {
    product_id: "a3d7b8ea-7d4d-4cdd-8c4a-1f5c8c3f3b20",
    movement_date: "2026-01-04",
    qty_in: "50.0000",
    qty_out: "12.0000",
  },
  {
    product_id: "a3d7b8ea-7d4d-4cdd-8c4a-1f5c8c3f3b20",
    movement_date: "2026-01-05",
    qty_in: "0.0000",
    qty_out: "8.0000",
  },
  {
    product_id: "b4e8c9fb-8e5e-5dee-9d5b-2g6d9d4g4c31",
    movement_date: "2026-01-04",
    qty_in: "30.0000",
    qty_out: "5.0000",
  },
  {
    product_id: "c5f9d0gc-9f6f-6eff-0e6c-3h7e0e5h5d42",
    movement_date: "2026-01-06",
    qty_in: "15.0000",
    qty_out: "10.0000",
  },
]

const mockSalesSummary: SalesSummaryReport[] = [
  {
    order_date: "2026-01-04",
    orders_count: 3,
    total_quantity: "27.0000",
    total_sales: "13500.0000",
  },
  {
    order_date: "2026-01-05",
    orders_count: 5,
    total_quantity: "42.0000",
    total_sales: "21000.0000",
  },
  {
    order_date: "2026-01-06",
    orders_count: 2,
    total_quantity: "15.0000",
    total_sales: "8500.0000",
  },
  {
    order_date: "2026-01-07",
    orders_count: 4,
    total_quantity: "33.0000",
    total_sales: "17800.0000",
  },
]

const mockPricingGovernance: PricingGovernanceReport[] = [
  {
    total_items: 120,
    rule_used_count: 85,
    discounted_items: 30,
    avg_discount_percent: "4.25",
  },
]

const mockFulfillment: FulfillmentReport[] = [
  { status: "draft", order_count: 2 },
  { status: "confirmed", order_count: 5 },
  { status: "reserved", order_count: 3 },
  { status: "partially_delivered", order_count: 1 },
  { status: "delivered", order_count: 9 },
  { status: "cancelled", order_count: 1 },
]

const mockReceivables: ReceivablesReport[] = [
  {
    id: "4cf0b6d7-0d7b-4b37-a9a4-2c4210d2e6c7",
    partner_id: "c2b9d0c0-3a8d-4c20-9a31-3d8c29f2f5d1",
    amount: "15000.0000",
    balance: "5000.0000",
    due_date: "2025-12-25",
    overdue_days: 17,
    status: "overdue",
  },
  {
    id: "5dg1c7e8-1e8c-5c48-b0b5-3d5321e3f7d8",
    partner_id: "d3c0e1d1-4b9e-5d31-0b42-4e9d30g3g6e2",
    amount: "25000.0000",
    balance: "25000.0000",
    due_date: "2026-02-15",
    overdue_days: 0,
    status: "open",
  },
  {
    id: "6eh2d8f9-2f9d-6d59-c1c6-4e6432f4g8e9",
    partner_id: "e4d1f2e2-5c0f-6e42-1c53-5f0e41h4h7f3",
    amount: "8000.0000",
    balance: "3000.0000",
    due_date: "2026-01-30",
    overdue_days: 0,
    status: "partially_paid",
  },
]

const mockPayables: PayablesReport[] = [
  {
    id: "7fi3e9g0-3g0e-7e60-d2d7-5g7543g5h9f0",
    supplier_id: "f5e2g3f3-6d1g-7f53-2d64-6g1f52i5i8g4",
    amount: "12000.0000",
    balance: "12000.0000",
    due_date: "2025-12-30",
    overdue_days: 12,
    status: "overdue",
  },
  {
    id: "8gj4f0h1-4h1f-8f71-e3e8-6h8654h6i0g1",
    supplier_id: "g6f3h4g4-7e2h-8g64-3e75-7h2g63j6j9h5",
    amount: "18000.0000",
    balance: "8000.0000",
    due_date: "2026-01-20",
    overdue_days: 0,
    status: "partially_paid",
  },
]

const mockCashflow: CashflowReport[] = [
  {
    transaction_id: "txn001",
    account_name: "Main Bank Account",
    transaction_date: "2026-01-03",
    inflow: "2500.0000",
    outflow: "0.0000",
    category: "Sales Revenue",
    balance_after: "2500.0000",
  },
  {
    transaction_id: "txn002",
    account_name: "Main Bank Account",
    transaction_date: "2026-01-04",
    inflow: "1800.0000",
    outflow: "500.0000",
    category: "Operating Expense",
    balance_after: "3800.0000",
  },
  {
    transaction_id: "txn003",
    account_name: "Main Bank Account",
    transaction_date: "2026-01-05",
    inflow: "3200.0000",
    outflow: "0.0000",
    category: "Sales Revenue",
    balance_after: "7000.0000",
  },
  {
    transaction_id: "txn004",
    account_name: "Main Bank Account",
    transaction_date: "2026-01-06",
    inflow: "2100.0000",
    outflow: "1200.0000",
    category: "Operating Expense",
    balance_after: "7900.0000",
  },
  {
    transaction_id: "txn005",
    account_name: "Main Bank Account",
    transaction_date: "2026-01-07",
    inflow: "4500.0000",
    outflow: "0.0000",
    category: "Sales Revenue",
    balance_after: "12400.0000",
  },
  {
    transaction_id: "txn006",
    account_name: "Main Bank Account",
    transaction_date: "2026-01-08",
    inflow: "2800.0000",
    outflow: "800.0000",
    category: "Operating Expense",
    balance_after: "14400.0000",
  },
]

const mockProfitability: ProfitabilityReport[] = [
  {
    revenue: "120000.0000",
    cogs: "85000.0000",
    profit: "35000.0000",
    avg_margin: "29.17",
  },
]

const mockAgentPerformance: AgentPerformanceReport[] = [
  {
    sales_count: 12,
    gross_sales: "45000.0000",
    commission_earned: "4500.0000",
    principal_payable: "40500.0000",
  },
  {
    sales_count: 8,
    gross_sales: "28000.0000",
    commission_earned: "2800.0000",
    principal_payable: "25200.0000",
  },
  {
    sales_count: 15,
    gross_sales: "62000.0000",
    commission_earned: "6200.0000",
    principal_payable: "55800.0000",
  },
]

const mockSettlements: AgentSettlementReport[] = [
  { status: "draft", count: 2, total_amount: "3000.0000" },
  { status: "confirmed", count: 3, total_amount: "7500.0000" },
  { status: "invoiced", count: 5, total_amount: "15000.0000" },
  { status: "cancelled", count: 1, total_amount: "1200.0000" },
]

// ============================================
// INVENTORY REPORTS
// ============================================

export const inventoryReportService = {
  getStockPosition: async (filters: StockPositionFilters): Promise<StockPositionReport[]> => {
    if (USE_MOCK_DATA) {
      let filtered = [...mockStockPosition]

      if (filters.productId) {
        filtered = filtered.filter((item) => item.product_id === filters.productId)
      }
      if (filters.warehouseId) {
        filtered = filtered.filter((item) => item.warehouse_id === filters.warehouseId)
      }
      if (filters.shopId) {
        filtered = filtered.filter((item) => item.shop_id === filters.shopId)
      }

      return Promise.resolve(filtered)
    }

    const response = await axiosInstance.get(`${BASE_URL}/inventory/stock-position`, { params: filters })
    return response.data
  },

  exportStockPosition: async (filters: StockPositionFilters, format: ExportFormat): Promise<Blob> => {
    if (USE_MOCK_DATA) {
      const data = await inventoryReportService.getStockPosition(filters)
      const csv = [
        "Product ID,Product Name,Warehouse ID,Shop ID,On Hand Qty,Reserved Qty,Available Qty",
        ...data.map(
          (row) =>
            `${row.product_id},${row.product_name},${row.warehouse_id || ""},${row.shop_id || ""},${row.on_hand_qty},${row.reserved_qty},${row.available_qty}`,
        ),
      ].join("\n")
      return Promise.resolve(new Blob([csv], { type: "text/csv" }))
    }

    const response = await axiosInstance.get(`${BASE_URL}/inventory/stock-position/export`, {
      params: { ...filters, format },
      responseType: "blob",
    })
    return response.data
  },

  getMovement: async (filters: MovementFilters): Promise<MovementReport[]> => {
    if (USE_MOCK_DATA) {
      let filtered = [...mockMovementReport]

      if (filters.fromDate) {
        filtered = filtered.filter((item) => item.movement_date >= filters.fromDate!)
      }
      if (filters.toDate) {
        filtered = filtered.filter((item) => item.movement_date <= filters.toDate!)
      }

      return Promise.resolve(filtered)
    }

    const response = await axiosInstance.get(`${BASE_URL}/inventory/movement`, {
      params: filters,
    })
    return response.data
  },

  exportMovement: async (filters: MovementFilters, format: ExportFormat): Promise<Blob> => {
    if (USE_MOCK_DATA) {
      const data = await inventoryReportService.getMovement(filters)
      const csv = [
        "Product ID,Movement Date,Qty In,Qty Out",
        ...data.map((row) => `${row.product_id},${row.movement_date},${row.qty_in},${row.qty_out}`),
      ].join("\n")
      return Promise.resolve(new Blob([csv], { type: "text/csv" }))
    }

    const response = await axiosInstance.get(`${BASE_URL}/inventory/movement/export`, {
      params: { ...filters, format },
      responseType: "blob",
    })
    return response.data
  },
}

// ============================================
// SALES REPORTS
// ============================================

export const salesReportService = {
  getSummary: async (filters: SalesSummaryFilters): Promise<SalesSummaryReport[]> => {
    if (USE_MOCK_DATA) {
      let filtered = [...mockSalesSummary]

      if (filters.fromDate) {
        filtered = filtered.filter((item) => item.order_date >= filters.fromDate!)
      }
      if (filters.toDate) {
        filtered = filtered.filter((item) => item.order_date <= filters.toDate!)
      }

      return Promise.resolve(filtered)
    }

    const response = await axiosInstance.get(`${BASE_URL}/sales/summary`, {
      params: filters,
    })
    return response.data
  },

  exportSummary: async (filters: SalesSummaryFilters, format: ExportFormat): Promise<Blob> => {
    if (USE_MOCK_DATA) {
      const data = await salesReportService.getSummary(filters)
      const csv = [
        "Order Date,Orders Count,Total Quantity,Total Sales",
        ...data.map((row) => `${row.order_date},${row.orders_count},${row.total_quantity},${row.total_sales}`),
      ].join("\n")
      return Promise.resolve(new Blob([csv], { type: "text/csv" }))
    }

    const response = await axiosInstance.get(`${BASE_URL}/sales/summary/export`, {
      params: { ...filters, format },
      responseType: "blob",
    })
    return response.data
  },

  getPricingGovernance: async (filters: PricingGovernanceFilters): Promise<PricingGovernanceReport[]> => {
    if (USE_MOCK_DATA) {
      return Promise.resolve([...mockPricingGovernance])
    }

    const response = await axiosInstance.get(`${BASE_URL}/sales/pricing-governance`, { params: filters })
    return response.data
  },

  getFulfillment: async (filters: FulfillmentFilters): Promise<FulfillmentReport[]> => {
    if (USE_MOCK_DATA) {
      return Promise.resolve([...mockFulfillment])
    }

    const response = await axiosInstance.get(`${BASE_URL}/sales/fulfillment`, {
      params: filters,
    })
    return response.data
  },
}

// ============================================
// FINANCE REPORTS
// ============================================

export const financeReportService = {
  getReceivables: async (filters: ReceivablesFilters): Promise<ReceivablesReport[]> => {
    if (USE_MOCK_DATA) {
      return Promise.resolve([...mockReceivables])
    }

    const response = await axiosInstance.get(`${BASE_URL}/finance/receivables`, {
      params: filters,
    })
    return response.data
  },

  exportReceivables: async (filters: ReceivablesFilters, format: ExportFormat): Promise<Blob> => {
    if (USE_MOCK_DATA) {
      const data = await financeReportService.getReceivables(filters)
      const csv = [
        "ID,Partner ID,Amount,Balance,Due Date,Overdue Days,Status",
        ...data.map(
          (row) =>
            `${row.id},${row.partner_id},${row.amount},${row.balance},${row.due_date},${row.overdue_days},${row.status}`,
        ),
      ].join("\n")
      return Promise.resolve(new Blob([csv], { type: "text/csv" }))
    }

    const response = await axiosInstance.get(`${BASE_URL}/finance/receivables/export`, {
      params: { ...filters, format },
      responseType: "blob",
    })
    return response.data
  },

  getPayables: async (filters: PayablesFilters): Promise<PayablesReport[]> => {
    if (USE_MOCK_DATA) {
      return Promise.resolve([...mockPayables])
    }

    const response = await axiosInstance.get(`${BASE_URL}/finance/payables`, {
      params: filters,
    })
    return response.data
  },

  exportPayables: async (filters: PayablesFilters, format: ExportFormat): Promise<Blob> => {
    if (USE_MOCK_DATA) {
      const data = await financeReportService.getPayables(filters)
      const csv = [
        "ID,Supplier ID,Amount,Balance,Due Date,Overdue Days,Status",
        ...data.map(
          (row) =>
            `${row.id},${row.supplier_id},${row.amount},${row.balance},${row.due_date},${row.overdue_days},${row.status}`,
        ),
      ].join("\n")
      return Promise.resolve(new Blob([csv], { type: "text/csv" }))
    }

    const response = await axiosInstance.get(`${BASE_URL}/finance/payables/export`, {
      params: { ...filters, format },
      responseType: "blob",
    })
    return response.data
  },

  getCashflow: async (filters: CashflowFilters): Promise<CashflowReport[]> => {
    if (USE_MOCK_DATA) {
      return Promise.resolve([...mockCashflow])
    }

    const response = await axiosInstance.get(`${BASE_URL}/finance/cashflow`, {
      params: filters,
    })
    return response.data
  },

  getProfitability: async (filters: ProfitabilityFilters): Promise<ProfitabilityReport[]> => {
    if (USE_MOCK_DATA) {
      return Promise.resolve([...mockProfitability])
    }

    const response = await axiosInstance.get(`${BASE_URL}/finance/profitability`, { params: filters })
    return response.data
  },
}

// ============================================
// AGENT REPORTS
// ============================================

export const agentReportService = {
  getPerformance: async (filters: AgentPerformanceFilters): Promise<AgentPerformanceReport[]> => {
    if (USE_MOCK_DATA) {
      return Promise.resolve([...mockAgentPerformance])
    }

    const response = await axiosInstance.get(`${BASE_URL}/agent/performance`, {
      params: filters,
    })
    return response.data
  },

  exportPerformance: async (filters: AgentPerformanceFilters, format: ExportFormat): Promise<Blob> => {
    if (USE_MOCK_DATA) {
      const data = await agentReportService.getPerformance(filters)
      const csv = [
        "Sales Count,Gross Sales,Commission Earned,Principal Payable",
        ...data.map((row) => `${row.sales_count},${row.gross_sales},${row.commission_earned},${row.principal_payable}`),
      ].join("\n")
      return Promise.resolve(new Blob([csv], { type: "text/csv" }))
    }

    const response = await axiosInstance.get(`${BASE_URL}/agent/performance/export`, {
      params: { ...filters, format },
      responseType: "blob",
    })
    return response.data
  },

  getSettlements: async (filters: AgentSettlementFilters): Promise<AgentSettlementReport[]> => {
    if (USE_MOCK_DATA) {
      return Promise.resolve([...mockSettlements])
    }

    const response = await axiosInstance.get(`${BASE_URL}/agent/settlements`, {
      params: filters,
    })
    return response.data
  },
}
