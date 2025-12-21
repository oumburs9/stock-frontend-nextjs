import { axiosInstance } from "@/lib/api/axios-instance"
import type { PaymentSource, CreatePaymentSourceRequest, UpdatePaymentSourceRequest } from "@/lib/types/payment-source"

// ============================================================================
// MOCK DATA - Following frozen API contract exactly
// ============================================================================
const USE_MOCK_DATA = false

let MOCK_PAYMENT_SOURCES: PaymentSource[] = [
  {
    id: "PS_BANK_1",
    name: "CBEB Main Bank Account",
    type: "bank_account",
    account_number: "100200300",
    is_active: true,
    created_at: "2025-01-01T09:00:00.000Z",
    updated_at: "2025-01-01T09:00:00.000Z",
  },
  {
    id: "PS_CASH_1",
    name: "Office Cash Register",
    type: "cash_register",
    account_number: null,
    is_active: true,
    created_at: "2025-01-01T09:05:00.000Z",
    updated_at: "2025-01-01T09:05:00.000Z",
  },
  {
    id: "PS_WALLET_1",
    name: "Telebirr Wallet",
    type: "mobile_wallet",
    account_number: null,
    is_active: true,
    created_at: "2025-01-02T10:00:00.000Z",
    updated_at: "2025-01-02T10:00:00.000Z",
  },
  {
    id: "PS_CASH_2",
    name: "Store Front Cash Drawer",
    type: "cash_register",
    account_number: null,
    is_active: false,
    created_at: "2024-12-15T14:00:00.000Z",
    updated_at: "2025-01-03T11:00:00.000Z",
  },
]

class PaymentSourceService {
  // GET /master-data/payment-sources
  async getPaymentSources(): Promise<PaymentSource[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return [...MOCK_PAYMENT_SOURCES]
    }

    const response = await axiosInstance.get<PaymentSource[]>("/master-data/payment-sources")
    return response.data
  }

  // GET /master-data/payment-sources/active
  async getActivePaymentSources(): Promise<PaymentSource[]> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return MOCK_PAYMENT_SOURCES.filter((ps) => ps.is_active)
    }

    const response = await axiosInstance.get<PaymentSource[]>("/master-data/payment-sources/active")
    return response.data
  }

  // GET /master-data/payment-sources/{id}
  async getPaymentSource(id: string): Promise<PaymentSource> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      const source = MOCK_PAYMENT_SOURCES.find((ps) => ps.id === id)
      if (!source) throw new Error("Payment source not found")
      return source
    }

    try {
      const response = await axiosInstance.get<PaymentSource>(`/master-data/payment-sources/${id}`)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) throw new Error("Payment source not found")
      throw new Error("Failed to fetch payment source")
    }
  }

  // POST /master-data/payment-sources
  async createPaymentSource(data: CreatePaymentSourceRequest): Promise<PaymentSource> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400))
      const newSource: PaymentSource = {
        id: `PS_${Date.now()}`,
        name: data.name,
        type: data.type,
        account_number: data.account_number || null,
        is_active: data.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      MOCK_PAYMENT_SOURCES.push(newSource)
      return newSource
    }

    const response = await axiosInstance.post<PaymentSource>("/master-data/payment-sources", data)
    return response.data
  }

  // PATCH /master-data/payment-sources/{id}
  async updatePaymentSource(id: string, data: UpdatePaymentSourceRequest): Promise<PaymentSource> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400))
      const index = MOCK_PAYMENT_SOURCES.findIndex((ps) => ps.id === id)
      if (index === -1) throw new Error("Payment source not found")

      MOCK_PAYMENT_SOURCES[index] = {
        ...MOCK_PAYMENT_SOURCES[index],
        ...data,
        updated_at: new Date().toISOString(),
      }
      return MOCK_PAYMENT_SOURCES[index]
    }

    try {
      const response = await axiosInstance.patch<PaymentSource>(
        `/master-data/payment-sources/${id}`,
        data,
      )
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) throw new Error("Payment source not found")
      throw new Error("Failed to update payment source")
    }
  }

  // DELETE /master-data/payment-sources/{id}
  async deletePaymentSource(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 400))
      const index = MOCK_PAYMENT_SOURCES.findIndex((ps) => ps.id === id)
      if (index === -1) throw new Error("Payment source not found")

      const isReferenced = id === "PS_BANK_1"
      if (isReferenced) {
        throw new Error("Cannot delete payment source (it may be referenced by payments)")
      }

      MOCK_PAYMENT_SOURCES = MOCK_PAYMENT_SOURCES.filter((ps) => ps.id !== id)
      return
    }

    try {
      await axiosInstance.delete(`/master-data/payment-sources/${id}`)
    } catch (error: any) {
      if (error.response?.status === 404) throw new Error("Payment source not found")
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || "Cannot delete payment source")
      }
      throw new Error("Failed to delete payment source")
    }
  }
}

export const paymentSourceService = new PaymentSourceService()
