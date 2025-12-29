// Sales & Pricing module types following frozen API contract

export interface PricingRule {
  id: string
  name: string
  description: string | null
  target_type: "all" | "product" | "category" | "brand"
  target_product_id: string | null
  target_category_id: string | null
  target_brand_id: string | null
  margin_percent: string | null
  fixed_price: string | null
  is_active: boolean
  valid_from: string | null
  valid_to: string | null
  created_at: string
}

export interface CreatePricingRuleRequest {
  name: string
  description?: string
  targetType: "all" | "product" | "category" | "brand"
  targetProductId?: string
  targetCategoryId?: string
  targetBrandId?: string
  marginPercent?: string
  fixedPrice?: string
  validFrom?: string
  validTo?: string
}

export interface UpdatePricingRuleRequest {
  name?: string
  description?: string
  marginPercent?: string
  fixedPrice?: string
  isActive?: boolean
  validFrom?: string
  validTo?: string
}

export interface PriceQuote {
  listPrice: string
  costBasis: string
  pricingRuleId: string | null
  appliedMarginPercent: string | null
  unitCost: string
}

export interface SalesOrder {
  id: string
  code: string
  customer_id: string
  warehouse_id: string | null
  shop_id: string | null
  status: "draft" | "confirmed" | "reserved" | "partially_delivered" | "delivered" | "cancelled"
  order_date: string
  currency: string
  payment_terms: string
  notes: string | null
  created_at: string
  updated_at: string
  items?: SalesOrderItem[]
}

export interface SalesOrderItem {
  id: string
  sales_order_id: string
  product_id: string
  quantity: string
  list_price: string
  unit_price: string
  discount_amount: string
  discount_percent: string
  pricing_rule_id: string | null
  total_price: string
}

export interface CreateSalesOrderRequest {
  customerId: string
  warehouseId?: string
  shopId?: string
  orderDate: string
  currency?: string
  paymentTerms?: string
  notes?: string
}

export interface UpdateSalesOrderRequest {
  customerId?: string
  warehouseId?: string
  shopId?: string
  orderDate?: string
  currency?: string
  paymentTerms?: string
  notes?: string
}

export interface AddSalesOrderItemRequest {
  productId: string
  quantity: string
  unitPrice?: string
  discountAmount?: string
  discountPercent?: string
}

export interface UpdateSalesOrderItemRequest {
  // quantity?: string
  unitPrice?: string
  discountAmount?: string
  discountPercent?: string
}

export interface StockReservation {
  id: string
  product_id: string
  warehouse_id: string | null
  shop_id: string | null
  quantity: string
  sales_order_id: string | null
  status: "active" | "consumed" | "released"
  created_at: string
}

export interface CreateReservationRequest {
  productId: string
  warehouseId?: string
  shopId?: string
  quantity: string
  salesOrderId?: string
}
