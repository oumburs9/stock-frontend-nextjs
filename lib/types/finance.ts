// Finance API Contract v1 (Frozen) - Exact match

// ===== INVOICES =====

export interface Invoice {
  id: string
  invoice_number: string
  sales_order_id: string
  customer_id: string
  invoice_date: string
  due_days: number
  due_date: string
  currency: string
  subtotal: string
  tax_amount: string
  total_amount: string
  tax_rule_id: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  product_id: string
  quantity: string
  unit_price: string
  line_subtotal: string
  tax_amount: string
  line_total: string
}

export interface IssueInvoiceRequest {
  salesOrderId: string
  invoiceDate: string
  dueDays: number
  taxRuleId?: string | null
}

// ===== RECEIVABLES =====

export interface Receivable {
  id: string
  invoice_id: string
  partner_id: string
  amount: string
  balance: string
  due_date: string
  status: string
  created_at: string
  updated_at: string
}

export interface ReceivablePayment {
  id: string
  receivable_id: string
  payment_date: string
  amount: string
  method: string
  payment_source_id: string | null
  reference: string | null
  created_at: string
}

export interface CreateReceivablePaymentRequest {
  receivableId: string
  paymentDate: string
  amount: string
  method: string
  paymentSourceId?: string | null
  reference?: string | null
}

// ===== PAYABLES =====

export interface Payable {
  id: string
  supplier_id: string
  purchase_order_id: string | null
  purchase_shipment_id: string | null
  payable_date: string
  due_days: number
  due_date: string
  currency: string
  amount: string
  balance: string
  status: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PayablePayment {
  id: string
  payable_id: string
  payment_date: string
  amount: string
  method: string
  payment_source_id: string | null
  reference: string | null
  created_at: string
}

export interface CreatePayableRequest {
  supplierId: string
  purchaseShipmentId?: string | null
  purchaseOrderId?: string | null
  payableDate: string
  dueDays: number
  currency: string
  amount: string
  notes?: string | null
}

export interface CreatePayablePaymentRequest {
  payableId: string
  paymentDate: string
  amount: string
  method: string
  paymentSourceId?: string | null
  reference?: string | null
}

// ===== TAX =====

export interface TaxConfig {
  id: string
  is_enabled: boolean
  default_tax_rule_id: string | null
  created_at: string
  updated_at: string
}

export interface TaxRule {
  id: string
  name: string
  rate: string
  is_active: boolean
  valid_from: string | null
  valid_to: string | null
  created_at: string
  updated_at: string
}

export interface UpsertTaxConfigRequest {
  isEnabled: boolean
  defaultTaxRuleId?: string | null
}

export interface CreateTaxRuleRequest {
  name: string
  rate: string
  isActive: boolean
  validFrom?: string | null
  validTo?: string | null
}

export interface UpdateTaxRuleRequest {
  name?: string
  rate?: string
  isActive?: boolean
  validFrom?: string | null
  validTo?: string | null
}

// ===== COSTING =====

export interface Costing {
  id: string
  sales_order_id: string
  invoice_id: string
  revenue_amount: string
  cogs_amount: string
  profit_amount: string
  margin_percent: string
  created_at: string
}
