// Purchase module types following frozen API contract

export interface ExpenseType {
  id: string
  code: string
  name: string
  scope: "shipment" | "batch"
  is_active: boolean
  capitalizable: boolean
  default_allocation_method: string | null
}

export interface CreateExpenseTypeRequest {
  code: string
  name: string
  scope: "shipment" | "batch"
  capitalizable: boolean
}

export interface UpdateExpenseTypeRequest {
  name?: string
  capitalizable?: boolean
}

export interface PurchaseOrderItem {
  id: string
  purchase_order_id: string
  product_id: string
  quantity: string
  unit_price: string
  unit_id: string | null
  total_price: string
}

export interface PurchaseOrder {
  id: string
  code: string
  supplier_id: string
  status: "draft" | "approved" | "cancelled" | "received"
  order_date: string
  expected_date: string | null
  currency: string
  notes: string | null
  created_at: string
  updated_at: string
  items: PurchaseOrderItem[]
}

export interface CreatePurchaseOrderRequest {
  code: string
  supplier_id: string
  order_date: string
  expected_date?: string | null
  currency?: string
  notes?: string | null
  items: {
    product_id: string
    quantity: string
    unit_price: string
  }[]
}

export interface UpdatePurchaseOrderRequest {
  supplier_id?: string
  order_date?: string
  expected_date?: string | null
  currency?: string
  notes?: string
  items?: {
    product_id: string
    quantity: string
    unit_price: string
  }[]
}

export interface ReceivePurchaseOrderRequest {
  lines: {
    purchase_order_item_id: string
    quantity_received: string
    location_type: "warehouse" | "shop"
    location_id: string
  }[]
}

export interface ReceivePurchaseOrderResponse {
  purchase_order_id: string
  status: string
  postings: {
    purchase_order_item_id: string
    product_id: string
    received_quantity: string
    location: {
      type: "warehouse" | "shop"
      id: string
    }
    batch_id: string
    stock_posting: {
      stockId: string
      txId: string
      beforeQuantity: string
      afterQuantity: string
    }
  }[]
}

export interface ShipmentItem {
  id: string
  shipment_id: string
  purchase_order_item_id: string | null
  product_id: string
  quantity_expected: string
  quantity_received: string
}

export interface ShipmentExpense {
  id: string
  shipment_id: string
  expense_type_id: string | null
  type: string
  amount: string
  currency: string
  description: string | null
  expense_date: string
  adjustments?: ShipmentExpenseAdjustment[]
}

export interface ShipmentExpenseAdjustment {
  id: string
  shipment_expense_id: string
  amount: string
  reason: string | null
  created_by: string
  created_at: string
}

export interface CreateShipmentExpenseAdjustmentRequest {
  amount: string
  reason?: string
}

export interface PurchaseShipment {
  id: string
  code: string
  type: "import" | "local"
  status?: "draft" | "partially_received" | "received" | "closed"
  supplier_id: string
  receiving_warehouse_id?: string | null
  receiving_shop_id?: string | null
  departure_date?: string | null
  arrival_date?: string | null
  currency?: string
  exchange_rate?: string | null
  notes?: string | null
  created_at?: string
  updated_at?: string
  items: ShipmentItem[]
  expenses?: ShipmentExpense[]
}

export interface CreateShipmentRequest {
  code: string
  type: "import" | "local"
  supplier_id: string
  departure_date?: string | null
  arrival_date?: string | null
  currency?: string
  exchange_rate?: string | null
  notes?: string | null
  items: {
    purchase_order_item_id?: string // Optional - links to PO item
    product_id: string // Always required
    quantity_expected: string
  }[]
}

export interface UpdateShipmentRequest {
  arrival_date?: string
  departure_date?: string
  receiving_warehouse_id?: string
  receiving_shop_id?: string
  exchange_rate?: string
  notes?: string
}

export interface AddShipmentExpenseRequest {
  // type: string
  expense_type_id: string
  amount: string
  description?: string
}

export interface ReceiveShipmentRequest {
  lines: {
    shipment_item_id: string
    base_unit_cost: string
    allocations: {
      location_type: "warehouse" | "shop"
      location_id: string
      quantity: string
    }[]
  }[]
}

export interface ReceiveShipmentResponse {
  shipment_id: string
  status: "partially_received" | "received"
  expense_per_unit: string
  postings: {
    shipment_item_id: string
    product_id: string
    allocation: {
      type: "warehouse" | "shop"
      id: string
      quantity: string
    }
    batch_id: string
    stock_posting: {
      stockId: string
      txId: string
      beforeQuantity: string
      afterQuantity: string
    }
  }[]
}

export interface Batch {
  id: string
  product_id: string
  shipment_id: string
  quantity_received: string
  quantity_remaining: string
  base_unit_cost: string
  landed_unit_cost: string
  received_at: string
}

export interface BatchExpense {
  id: string
  batch_id: string
  expense_type_id: string | null
  type: string
  amount: string
  description: string | null
  expense_date: string
  adjustments?: BatchExpenseAdjustment[]
}

export interface BatchExpenseAdjustment {
  id: string
  batch_expense_id: string
  amount: string
  reason: string | null
  created_by: string
  created_at: string
}

export interface CreateBatchExpenseAdjustmentRequest {
  amount: string
  reason?: string
}

export interface AddBatchExpenseRequest {
  type: string
  amount: string
  description?: string
}
