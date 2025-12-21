// Frozen API Contract - Payment Source Types
// Do not modify without backend alignment

export type PaymentSourceType = "bank_account" | "cash_register" | "mobile_wallet"

export interface PaymentSource {
  id: string
  name: string
  type: PaymentSourceType
  account_number: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreatePaymentSourceRequest {
  name: string
  type: PaymentSourceType
  account_number?: string | null
  is_active?: boolean
}

export interface UpdatePaymentSourceRequest {
  name?: string
  type?: PaymentSourceType
  account_number?: string | null
  is_active?: boolean
}
