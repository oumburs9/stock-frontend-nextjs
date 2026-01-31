import { axiosInstance } from "@/lib/api/axios-instance"
import type {
  AgentSale,
  CreateAgentSaleRequest,
  UpdateAgentSaleRequest,
  ConfirmAgentSaleRequest,
  IssueInvoiceRequest,
  CommissionRule,
  CreateCommissionRuleRequest,
  UpdateCommissionRuleRequest,
  AgentSaleItem,
} from "@/lib/types/agent-sales"

const USE_MOCK_DATA = false

// ===== MOCK DATA =====

const mockCommissionRules: CommissionRule[] = [
  {
    id: "cr-1",
    name: "License Use Commission 10%",
    commission_type: "license_use",
    basis_type: "percentage",
    value: "10.0000",
    currency: "ETB",
    is_active: true,
    valid_from: null,
    valid_to: null,
    created_at: "2026-01-02T08:00:00.000Z",
    updated_at: "2026-01-02T08:00:00.000Z",
  },
  {
    id: "cr-2",
    name: "Principal Commission 5%",
    commission_type: "principal_commission",
    basis_type: "percentage",
    value: "5.0000",
    currency: "ETB",
    is_active: true,
    valid_from: "2026-01-01",
    valid_to: null,
    created_at: "2026-01-02T08:30:00.000Z",
    updated_at: "2026-01-02T08:30:00.000Z",
  },
  {
    id: "cr-3",
    name: "High Value License 15%",
    commission_type: "license_use",
    basis_type: "percentage",
    value: "15.0000",
    currency: "ETB",
    is_active: false,
    valid_from: null,
    valid_to: "2025-12-31",
    created_at: "2025-12-01T08:00:00.000Z",
    updated_at: "2025-12-31T08:00:00.000Z",
  },
]

const mockAgentSales: AgentSale[] = [
  {
    id: "as-1",
    code: "AS-001",
    customer_id: "partner-1",
    principal_id: "partner-2",
    status: "draft",
    sale_date: "2025-01-15",
    currency: "ETB",
    commission_type: "license_use",
    gross_total: "5000.00",
    commission_total: "0.00",
    net_principal_total: "5000.00",
    invoice_id: null,
    payable_id: null,
    commission_rule_id: "cr-1",
    notes: null,
    created_at: "2025-01-15T10:00:00.000Z",
    updated_at: "2025-01-15T10:00:00.000Z",
    items: [
      {
        id: "item-1",
        agent_sale_id: "as-1",
        product_id: "prod-1",
        quantity: "10",
        gross_unit_price: "500.00",
        gross_line_total: "5000.00",
        commission_amount: "0.00",
        net_principal_amount: "5000.00",
      },
    ],
  },
  {
    id: "as-2",
    code: "AS-002",
    customer_id: "partner-3",
    principal_id: "partner-4",
    status: "confirmed",
    sale_date: "2025-01-16",
    currency: "ETB",
    commission_type: "principal_commission",
    gross_total: "125000.00",
    commission_total: "6250.00",
    net_principal_total: "118750.00",
    invoice_id: null,
    payable_id: null,
    commission_rule_id: "cr-2",
    notes: "Bulk order",
    created_at: "2025-01-16T11:00:00.000Z",
    updated_at: "2025-01-16T12:00:00.000Z",
    items: [
      {
        id: "item-2",
        agent_sale_id: "as-2",
        product_id: "prod-2",
        quantity: "50",
        gross_unit_price: "2500.00",
        gross_line_total: "125000.00",
        commission_amount: "6250.00",
        net_principal_amount: "118750.00",
      },
    ],
  },
]

// ===== SERVICES =====

class CommissionRuleService {
  async getCommissionRules(): Promise<CommissionRule[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return [...mockCommissionRules]
    }
    const response = await axiosInstance.get<CommissionRule[]>("/agent-sales/config/commission-rules")
    return response.data
  }

  async getCommissionRule(id: string): Promise<CommissionRule> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const rule = mockCommissionRules.find((r) => r.id === id)
      if (!rule) throw new Error("Commission rule not found")
      return rule
    }
    const response = await axiosInstance.get<CommissionRule>(`/agent-sales/config/commission-rules/${id}`)
    return response.data
  }

  async createCommissionRule(data: CreateCommissionRuleRequest): Promise<CommissionRule> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const newRule: CommissionRule = {
        id: crypto.randomUUID(),
        name: data.name,
        commission_type: data.commissionType,
        basis_type: data.basisType,
        value: data.value,
        currency: data.currency,
        is_active: data.isActive,
        valid_from: data.validFrom || null,
        valid_to: data.validTo || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      mockCommissionRules.push(newRule)
      return newRule
    }
    const response = await axiosInstance.post<CommissionRule>("/agent-sales/config/commission-rules", data)
    return response.data
  }

  async updateCommissionRule(id: string, data: UpdateCommissionRuleRequest): Promise<CommissionRule> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const index = mockCommissionRules.findIndex((r) => r.id === id)
      if (index === -1) throw new Error("Commission rule not found")

      mockCommissionRules[index] = {
        ...mockCommissionRules[index],
        name: data.name || mockCommissionRules[index].name,
        value: data.value || mockCommissionRules[index].value,
        is_active: data.isActive !== undefined ? data.isActive : mockCommissionRules[index].is_active,
        valid_from: data.validFrom !== undefined ? data.validFrom : mockCommissionRules[index].valid_from,
        valid_to: data.validTo !== undefined ? data.validTo : mockCommissionRules[index].valid_to,
        updated_at: new Date().toISOString(),
      }

      return mockCommissionRules[index]
    }

    const response = await axiosInstance.patch<CommissionRule>(`/agent-sales/config/commission-rules/${id}`, data)
    return response.data
  }

  async deleteCommissionRule(id: string): Promise<{ message: string }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const index = mockCommissionRules.findIndex((r) => r.id === id)
      if (index === -1) throw new Error("Commission rule not found")

      mockCommissionRules.splice(index, 1)
      return { message: "Commission rule deleted" }
    }
    const response = await axiosInstance.delete<{ message: string }>(`/agent-sales/config/commission-rules/${id}`)
    return response.data
  }
}

class AgentSaleService {
  async getAgentSales(params?: {
      q?: string
      status?: string
      payable_id?: string
    }): Promise<AgentSale[]> {
      const response = await axiosInstance.get<AgentSale[]>("/agent-sales", { params })
      return response.data
    }

  async getAgentSale(id: string): Promise<AgentSale> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      const sale = mockAgentSales.find((s) => s.id === id)
      if (!sale) throw new Error("Agent sale not found")
      return sale
    }

    const response = await axiosInstance.get<AgentSale>(`/agent-sales/${id}`)
    return response.data
  }

  async createAgentSale(data: CreateAgentSaleRequest): Promise<AgentSale> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))

      let grossTotal = 0
      const items: AgentSaleItem[] = data.items.map((item) => {
        const lineTotal = Number.parseFloat(item.quantity) * Number.parseFloat(item.grossUnitPrice)
        grossTotal += lineTotal
        return {
          id: crypto.randomUUID(),
          agent_sale_id: "", // Will be set below
          product_id: item.productId,
          quantity: item.quantity,
          gross_unit_price: item.grossUnitPrice,
          gross_line_total: lineTotal.toFixed(4),
          commission_amount: "0.0000",
          net_principal_amount: lineTotal.toFixed(4),
        }
      })

      const newSale: AgentSale = {
        id: crypto.randomUUID(),
        code: data.code,
        customer_id: data.customerId,
        principal_id: data.principalId,
        status: "draft",
        sale_date: data.saleDate,
        currency: data.currency,
        commission_type: data.commissionType,
        gross_total: grossTotal.toFixed(4),
        commission_total: "0.0000",
        net_principal_total: grossTotal.toFixed(4),
        invoice_id: null,
        payable_id: null,
        commission_rule_id: data.commissionRuleId || null,
        notes: data.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: items.map((item) => ({ ...item, agent_sale_id: "" })), // Will reference new sale
      }

      // Set agent_sale_id on items after sale is created
      newSale.items = newSale.items?.map((item) => ({ ...item, agent_sale_id: newSale.id }))

      mockAgentSales.push(newSale)
      return newSale
    }

    const response = await axiosInstance.post<AgentSale>("/agent-sales", data)
    return response.data
  }

  async updateAgentSale(id: string, data: UpdateAgentSaleRequest): Promise<AgentSale> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const index = mockAgentSales.findIndex((s) => s.id === id)
      if (index === -1) throw new Error("Agent sale not found")

      let grossTotal = mockAgentSales[index].gross_total
      let items = mockAgentSales[index].items

      if (data.items) {
        let calculatedGrossTotal = 0
        items = data.items.map((item) => {
          const lineTotal = Number.parseFloat(item.quantity) * Number.parseFloat(item.grossUnitPrice)
          calculatedGrossTotal += lineTotal
          return {
            id: crypto.randomUUID(),
            agent_sale_id: id,
            product_id: item.productId,
            quantity: item.quantity,
            gross_unit_price: item.grossUnitPrice,
            gross_line_total: lineTotal.toFixed(4),
            commission_amount: "0.0000",
            net_principal_amount: lineTotal.toFixed(4),
          }
        })
        grossTotal = calculatedGrossTotal.toFixed(4)
      }

      mockAgentSales[index] = {
        ...mockAgentSales[index],
        notes: data.notes !== undefined ? data.notes : mockAgentSales[index].notes,
        gross_total: grossTotal,
        net_principal_total: grossTotal,
        items: items,
        updated_at: new Date().toISOString(),
      }

      return mockAgentSales[index]
    }

    const response = await axiosInstance.patch<AgentSale>(`/agent-sales/${id}`, data)
    return response.data
  }

  async confirmAgentSale(id: string, data?: ConfirmAgentSaleRequest): Promise<AgentSale> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const saleIndex = mockAgentSales.findIndex((s) => s.id === id)
      if (saleIndex === -1) throw new Error("Agent sale not found")

      const sale = mockAgentSales[saleIndex]
      if (sale.status !== "draft") throw new Error("Only draft sales can be confirmed")

      const ruleId = data?.commissionRuleId || sale.commission_rule_id
      const rule = mockCommissionRules.find((r) => r.id === ruleId)

      if (!rule) throw new Error("Commission rule not found")
      if (!rule.is_active) throw new Error("Commission rule is inactive")

      const commissionPercent = Number.parseFloat(rule.value)
      const grossTotal = Number.parseFloat(sale.gross_total)
      const commissionAmount = (grossTotal * commissionPercent) / 100
      const netPrincipalTotal = grossTotal - commissionAmount

      sale.status = "confirmed"
      sale.commission_rule_id = ruleId
      sale.commission_total = commissionAmount.toFixed(4)
      sale.net_principal_total = netPrincipalTotal.toFixed(4)

      // Update items with commission amounts
      if (sale.items) {
        sale.items = sale.items.map((item) => ({
          ...item,
          commission_amount: ((Number.parseFloat(item.gross_line_total) * commissionPercent) / 100).toFixed(4),
          net_principal_amount: (
            Number.parseFloat(item.gross_line_total) -
            (Number.parseFloat(item.gross_line_total) * commissionPercent) / 100
          ).toFixed(4),
        }))
      }

      sale.updated_at = new Date().toISOString()
      mockAgentSales[saleIndex] = sale

      return sale
    }

    const response = await axiosInstance.post<AgentSale>(`/agent-sales/${id}/confirm`, data)
    return response.data
  }

  async issueInvoice(id: string, data: IssueInvoiceRequest): Promise<{ invoice_id: string }> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const sale = mockAgentSales.find((s) => s.id === id)
      if (!sale) throw new Error("Agent sale not found")
      if (sale.status !== "confirmed") throw new Error("Only confirmed sales can be invoiced")

      const invoiceId = crypto.randomUUID()
      sale.invoice_id = invoiceId
      return { invoice_id: invoiceId }
    }

    const response = await axiosInstance.post<{ invoice_id: string }>(`/agent-sales/${id}/issue-invoice`, data)
    return response.data
  }
}

export const commissionRulesService = new CommissionRuleService()
export const agentSalesService = new AgentSaleService()
