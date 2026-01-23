export interface CommissionRule {
  id: string
  name: string
  commission_type: "license_use" | "principal_commission"
  basis_type: "percentage"
  value: string
  currency: string
  is_active: boolean
  valid_from: string | null
  valid_to: string | null
  created_at: string
  updated_at: string
}

export interface CreateCommissionRuleRequest {
  name: string
  commissionType: "license_use" | "principal_commission"
  basisType: "percentage"
  value: string
  currency: string
  isActive: boolean
  validFrom?: string | null
  validTo?: string | null
}

export interface UpdateCommissionRuleRequest {
  name?: string
  value?: string
  isActive?: boolean
  validFrom?: string | null
  validTo?: string | null
}

export interface AgentSaleItem {
  id: string
  agent_sale_id: string
  product_id: string
  quantity: string
  gross_unit_price: string
  gross_line_total: string
  commission_amount: string
  net_principal_amount: string
}

export interface AgentSale {
  id: string
  code: string
  customer_id: string
  principal_id: string
  status: "draft" | "confirmed"
  sale_date: string
  currency: string
  commission_type: "license_use" | "principal_commission"
  gross_total: string
  commission_total: string
  net_principal_total: string
  invoice_id: string | null
  payable_id: string | null
  commission_rule_id: string | null // Added back commission_rule_id
  notes: string | null
  items?: AgentSaleItem[]
  created_at: string
  updated_at: string
}

export interface CreateAgentSaleItemRequest {
  productId: string
  quantity: string
  grossUnitPrice: string
}

export interface CreateAgentSaleRequest {
  code: string
  customerId: string
  principalId: string
  saleDate: string
  currency: string
  commissionType: "license_use" | "principal_commission"
  commissionRuleId: string // Changed from commissionPercent to commissionRuleId
  notes?: string | null
  items: CreateAgentSaleItemRequest[]
}

export interface UpdateAgentSaleRequest {
  notes?: string
  items?: CreateAgentSaleItemRequest[]
}

export interface ConfirmAgentSaleRequest {
  commissionRuleId?: string // Override commission rule on confirmation
}

export interface IssueInvoiceRequest {
  invoiceDate: string
  dueDays: number
  taxRuleId?: string | null
}
