import { axiosInstance } from "@/lib/api/axios-instance"
import type {
  Invoice,
  InvoiceWithItems,
  IssueInvoiceRequest,
  Receivable,
  ReceivablePayment,
  CreateReceivablePaymentRequest,
  Payable,
  PayablePayment,
  CreatePayableRequest,
  CreatePayablePaymentRequest,
  TaxConfig,
  TaxRule,
  UpsertTaxConfigRequest,
  CreateTaxRuleRequest,
  UpdateTaxRuleRequest,
  Costing,
} from "@/lib/types/finance"

const USE_MOCK_DATA = false

// ===== MOCK DATA (EXACT FROZEN API FORMAT) =====

const mockInvoices: InvoiceWithItems[] = [
  {
    id: "INV_UUID_1",
    invoice_number: "INV-1736500000000",
    sales_order_id: "SO_UUID_1",
    customer_id: "CUSTOMER_UUID_1",
    invoice_date: "2025-01-10",
    due_days: 30,
    due_date: "2025-02-09",
    currency: "ETB",
    subtotal: "100000.0000",
    tax_amount: "15000.0000",
    total_amount: "115000.0000",
    tax_rule_id: "TAX_RULE_UUID",
    status: "issued",
    created_at: "2025-01-10T10:00:00.000Z",
    updated_at: "2025-01-10T10:00:00.000Z",
    items: [
      {
        id: "INV_ITEM_UUID_1",
        invoice_id: "INV_UUID_1",
        product_id: "PROD_UUID_1",
        quantity: "1.0000",
        unit_price: "100000.000000",
        line_subtotal: "100000.0000",
        tax_amount: "15000.0000",
        line_total: "115000.0000",
      },
    ],
  },
  {
    id: "INV_UUID_2",
    invoice_number: "INV-1736500000001",
    sales_order_id: "SO_UUID_2",
    customer_id: "CUSTOMER_UUID_2",
    invoice_date: "2025-01-11",
    due_days: 30,
    due_date: "2025-02-10",
    currency: "ETB",
    subtotal: "200000.0000",
    tax_amount: "0.0000",
    total_amount: "200000.0000",
    tax_rule_id: null,
    status: "issued",
    created_at: "2025-01-11T10:00:00.000Z",
    updated_at: "2025-01-11T10:00:00.000Z",
    items: [
      {
        id: "INV_ITEM_UUID_2",
        invoice_id: "INV_UUID_2",
        product_id: "PROD_UUID_2",
        quantity: "2.0000",
        unit_price: "100000.000000",
        line_subtotal: "200000.0000",
        tax_amount: "0.0000",
        line_total: "200000.0000",
      },
    ],
  },
]

const mockReceivables: Receivable[] = [
  {
    id: "REC_UUID_1",
    invoice_id: "INV_UUID_1",
    partner_id: "CUSTOMER_UUID_1",
    amount: "115000.0000",
    balance: "65000.0000",
    due_date: "2025-02-09",
    status: "partially_paid",
    created_at: "2025-01-10T10:00:01.000Z",
    updated_at: "2025-01-15T10:00:01.000Z",
  },
  {
    id: "REC_UUID_2",
    invoice_id: "INV_UUID_2",
    partner_id: "CUSTOMER_UUID_2",
    amount: "200000.0000",
    balance: "200000.0000",
    due_date: "2025-02-10",
    status: "open",
    created_at: "2025-01-11T10:00:01.000Z",
    updated_at: "2025-01-11T10:00:01.000Z",
  },
]

const mockReceivablePayments: ReceivablePayment[] = [
  {
    id: "RECPAY_UUID_1",
    receivable_id: "REC_UUID_1",
    payment_date: "2025-01-15",
    amount: "50000.0000",
    method: "bank",
    payment_source_id: "PS_UUID_1",
    reference: "TXN-001",
    created_at: "2025-01-15T10:00:00.000Z",
  },
]

const mockPayables: Payable[] = [
  {
    id: "PAY_UUID_1",
    supplier_id: "SUPPLIER_UUID_1",
    purchase_order_id: null,
    purchase_shipment_id: "SHIP_UUID_1",
    payable_date: "2025-01-12",
    due_days: 30,
    due_date: "2025-02-11",
    currency: "ETB",
    amount: "500000.0000",
    balance: "500000.0000",
    status: "open",
    notes: "Supplier invoice for shipment",
    created_at: "2025-01-12T09:00:00.000Z",
    updated_at: "2025-01-12T09:00:00.000Z",
  },
  {
    id: "PAY_UUID_2",
    supplier_id: "SUPPLIER_UUID_2",
    purchase_order_id: "PO_UUID_1",
    purchase_shipment_id: null,
    payable_date: "2025-01-13",
    due_days: 15,
    due_date: "2025-01-28",
    currency: "ETB",
    amount: "250000.0000",
    balance: "250000.0000",
    status: "open",
    notes: "Supplier invoice for PO",
    created_at: "2025-01-13T09:00:00.000Z",
    updated_at: "2025-01-13T09:00:00.000Z",
  },
]

const mockPayablePayments: PayablePayment[] = []

const mockTaxConfig: TaxConfig = {
  id: "TAXCFG_UUID",
  is_enabled: true,
  default_tax_rule_id: "TAX_RULE_UUID",
  created_at: "2025-01-01T09:00:00.000Z",
  updated_at: "2025-01-01T09:00:00.000Z",
}

const mockTaxRules: TaxRule[] = [
  {
    id: "TAX_RULE_UUID",
    name: "VAT 15%",
    rate: "15.00",
    is_active: true,
    valid_from: null,
    valid_to: null,
    created_at: "2025-01-01T09:00:00.000Z",
    updated_at: "2025-01-01T09:00:00.000Z",
  },
  {
    id: "TAX_RULE_UUID_2",
    name: "VAT 5%",
    rate: "5.00",
    is_active: true,
    valid_from: null,
    valid_to: null,
    created_at: "2025-01-02T09:00:00.000Z",
    updated_at: "2025-01-02T09:00:00.000Z",
  },
]

const mockCostings: Costing[] = [
  {
    id: "COST_UUID_1",
    sales_order_id: "SO_UUID_1",
    invoice_id: "INV_UUID_1",
    revenue_amount: "100000.0000",
    cogs_amount: "75000.0000",
    profit_amount: "25000.0000",
    margin_percent: "25.00",
    created_at: "2025-01-10T10:00:02.000Z",
  },
]

// ===== INVOICE SERVICE =====

export const invoiceService = {
  getInvoices: async (): Promise<Invoice[]> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return mockInvoices.map(({ items, ...invoice }) => invoice)
    }

    const response = await axiosInstance.get<Invoice[]>("/finance/invoices")
    return response.data
  },

  getInvoice: async (id: string): Promise<InvoiceWithItems> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const invoice = mockInvoices.find((inv) => inv.id === id)
      if (!invoice) throw new Error("Invoice not found")
      return invoice
    }

    const response = await axiosInstance.get<InvoiceWithItems>(`/finance/invoices/${id}`)
    return response.data
  },

  issueInvoice: async (request: IssueInvoiceRequest): Promise<InvoiceWithItems> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const newInvoice: InvoiceWithItems = {
        id: `INV_UUID_${Date.now()}`,
        invoice_number: `INV-${Date.now()}`,
        sales_order_id: request.salesOrderId,
        customer_id: "CUSTOMER_UUID_NEW",
        invoice_date: request.invoiceDate,
        due_days: request.dueDays,
        due_date: new Date(new Date(request.invoiceDate).getTime() + request.dueDays * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        currency: "ETB",
        status: "issued",
        subtotal: "100000.0000",
        tax_amount: request.taxRuleId ? "15000.0000" : "0.0000",
        total_amount: request.taxRuleId ? "115000.0000" : "100000.0000",
        tax_rule_id: request.taxRuleId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: [],
      }
      mockInvoices.push(newInvoice)
      return newInvoice
    }

    const response = await axiosInstance.post<InvoiceWithItems>("/finance/invoices/issue", request)
    return response.data
  },
}

// ===== RECEIVABLE SERVICE =====

export const receivableService = {
  getReceivables: async (): Promise<Receivable[]> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return [...mockReceivables]
    }

    const response = await axiosInstance.get<Receivable[]>("/finance/receivables")
    return response.data
  },

  getReceivable: async (id: string): Promise<Receivable> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const receivable = mockReceivables.find((rec) => rec.id === id)
      if (!receivable) throw new Error("Receivable not found")
      return receivable
    }

    const response = await axiosInstance.get<Receivable>(`/finance/receivables/${id}`)
    return response.data
  },

  getReceivablePayments: async (id: string): Promise<ReceivablePayment[]> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return mockReceivablePayments.filter((pay) => pay.receivable_id === id)
    }

    const response = await axiosInstance.get<ReceivablePayment[]>(`/finance/receivables/${id}/payments`)
    return response.data
  },

  createReceivablePayment: async (request: CreateReceivablePaymentRequest): Promise<Receivable> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const receivable = mockReceivables.find((rec) => rec.id === request.receivableId)
      if (!receivable) throw new Error("Receivable not found")

      const payment: ReceivablePayment = {
        id: `RECPAY_UUID_${Date.now()}`,
        receivable_id: request.receivableId,
        payment_date: request.paymentDate,
        amount: request.amount,
        method: request.method,
        payment_source_id: request.paymentSourceId || null,
        reference: request.reference || null,
        created_at: new Date().toISOString(),
      }
      mockReceivablePayments.push(payment)

      const newBalance = Number.parseFloat(receivable.balance) - Number.parseFloat(request.amount)
      receivable.balance = newBalance.toFixed(4)
      receivable.status = newBalance <= 0 ? "paid" : "partially_paid"
      receivable.updated_at = new Date().toISOString()

      return receivable
    }

    const response = await axiosInstance.post<Receivable>("/finance/receivables/payments", request)
    return response.data
  },
}

// ===== PAYABLE SERVICE =====

export const payableService = {
  getPayables: async (): Promise<Payable[]> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return [...mockPayables]
    }

    const response = await axiosInstance.get<Payable[]>("/finance/payables")
    return response.data
  },

  getPayable: async (id: string): Promise<Payable> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const payable = mockPayables.find((pay) => pay.id === id)
      if (!payable) throw new Error("Payable not found")
      return payable
    }

    const response = await axiosInstance.get<Payable>(`/finance/payables/${id}`)
    return response.data
  },

  createPayable: async (request: CreatePayableRequest): Promise<Payable> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const newPayable: Payable = {
        id: `PAY_UUID_${Date.now()}`,
        supplier_id: request.supplierId,
        purchase_order_id: request.purchaseOrderId || null,
        purchase_shipment_id: request.purchaseShipmentId || null,
        payable_date: request.payableDate,
        due_days: request.dueDays,
        due_date: new Date(new Date(request.payableDate).getTime() + request.dueDays * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        currency: request.currency,
        amount: request.amount,
        balance: request.amount,
        status: "open",
        notes: request.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockPayables.push(newPayable)
      return newPayable
    }

    const response = await axiosInstance.post<Payable>("/finance/payables", request)
    return response.data
  },

  getPayablePayments: async (id: string): Promise<PayablePayment[]> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return mockPayablePayments.filter((pay) => pay.payable_id === id)
    }

    const response = await axiosInstance.get<PayablePayment[]>(`/finance/payables/${id}/payments`)
    return response.data
  },

  createPayablePayment: async (request: CreatePayablePaymentRequest): Promise<Payable> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const payable = mockPayables.find((pay) => pay.id === request.payableId)
      if (!payable) throw new Error("Payable not found")

      const payment: PayablePayment = {
        id: `PAYPAY_UUID_${Date.now()}`,
        payable_id: request.payableId,
        payment_date: request.paymentDate,
        amount: request.amount,
        method: request.method,
        payment_source_id: request.paymentSourceId || null,
        reference: request.reference || null,
        created_at: new Date().toISOString(),
      }
      mockPayablePayments.push(payment)

      const newBalance = Number.parseFloat(payable.balance) - Number.parseFloat(request.amount)
      payable.balance = newBalance.toFixed(4)
      payable.status = newBalance <= 0 ? "paid" : "partially_paid"
      payable.updated_at = new Date().toISOString()

      return payable
    }

    const response = await axiosInstance.post<Payable>("/finance/payables/payments", request)
    return response.data
  },
}

// ===== TAX SERVICE =====

export const taxService = {
  getTaxConfig: async (): Promise<TaxConfig | null> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return mockTaxConfig
    }

    const response = await axiosInstance.get<TaxConfig | null>("/finance/tax/config")
    return response.data
  },

  upsertTaxConfig: async (request: UpsertTaxConfigRequest): Promise<TaxConfig> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      mockTaxConfig.is_enabled = request.isEnabled
      mockTaxConfig.default_tax_rule_id = request.defaultTaxRuleId || null
      mockTaxConfig.updated_at = new Date().toISOString()
      return mockTaxConfig
    }

    const response = await axiosInstance.post<TaxConfig>("/finance/tax/config", request)
    return response.data
  },

  getTaxRules: async (): Promise<TaxRule[]> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return [...mockTaxRules]
    }

    const response = await axiosInstance.get<TaxRule[]>("/finance/tax/rules")
    return response.data
  },

  getTaxRule: async (id: string): Promise<TaxRule> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const rule = mockTaxRules.find((r) => r.id === id)
      if (!rule) throw new Error("Tax rule not found")
      return rule
    }

    const response = await axiosInstance.get<TaxRule>(`/finance/tax/rules/${id}`)
    return response.data
  },

  createTaxRule: async (request: CreateTaxRuleRequest): Promise<TaxRule> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const newRule: TaxRule = {
        id: `TAX_RULE_UUID_${Date.now()}`,
        name: request.name,
        rate: request.rate,
        is_active: request.isActive,
        valid_from: request.validFrom || null,
        valid_to: request.validTo || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockTaxRules.push(newRule)
      return newRule
    }

    const response = await axiosInstance.post<TaxRule>("/finance/tax/rules", request)
    return response.data
  },

  updateTaxRule: async (id: string, request: UpdateTaxRuleRequest): Promise<TaxRule> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const rule = mockTaxRules.find((r) => r.id === id)
      if (!rule) throw new Error("Tax rule not found")

      if (request.name !== undefined) rule.name = request.name
      if (request.rate !== undefined) rule.rate = request.rate
      if (request.isActive !== undefined) rule.is_active = request.isActive
      if (request.validFrom !== undefined) rule.valid_from = request.validFrom || null
      if (request.validTo !== undefined) rule.valid_to = request.validTo || null

      rule.updated_at = new Date().toISOString()
      return rule
    }

    const response = await axiosInstance.patch<TaxRule>(`/finance/tax/rules/${id}`, request)
    return response.data
  },

  deleteTaxRule: async (id: string): Promise<{ message: string }> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const index = mockTaxRules.findIndex((r) => r.id === id)
      if (index === -1) throw new Error("Tax rule not found")
      mockTaxRules.splice(index, 1)
      return { message: "Tax rule deleted" }
    }

    const response = await axiosInstance.delete<{ message: string }>(`/finance/tax/rules/${id}`)
    return response.data
  },
}

// ===== COSTING SERVICE =====

export const costingService = {
  getCostings: async (): Promise<Costing[]> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return [...mockCostings]
    }

    const response = await axiosInstance.get<Costing[]>("/finance/costing")
    return response.data
  },

  getCostingByInvoice: async (invoiceId: string): Promise<Costing> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const costing = mockCostings.find((c) => c.invoice_id === invoiceId)
      if (!costing) throw new Error("Sales costing not found")
      return costing
    }

    const response = await axiosInstance.get<Costing>(`/finance/costing/invoice/${invoiceId}`)
    return response.data
  },

  computeCosting: async (invoiceId: string): Promise<Costing> => {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const invoice = mockInvoices.find((inv) => inv.id === invoiceId)
      if (!invoice) throw new Error("Invoice not found")

      const revenue = Number.parseFloat(invoice.subtotal)
      const cogs = revenue * 0.75
      const profit = revenue - cogs
      const margin = ((profit / revenue) * 100).toFixed(2)

      const costing: Costing = {
        id: `COST_UUID_${Date.now()}`,
        sales_order_id: invoice.sales_order_id,
        invoice_id: invoiceId,
        revenue_amount: invoice.subtotal,
        cogs_amount: cogs.toFixed(4),
        profit_amount: profit.toFixed(4),
        margin_percent: margin,
        created_at: new Date().toISOString(),
      }

      const existingIndex = mockCostings.findIndex((c) => c.invoice_id === invoiceId)
      if (existingIndex !== -1) {
        mockCostings[existingIndex] = costing
      } else {
        mockCostings.push(costing)
      }

      return costing
    }

    const response = await axiosInstance.post<Costing>(`/finance/costing/invoice/${invoiceId}/compute`)
    return response.data
  },
}
