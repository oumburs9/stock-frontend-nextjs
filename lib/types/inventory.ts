// ============================================================================
// WAREHOUSE TYPES
// ============================================================================
export interface Warehouse {
  id: string
  name: string
  address: string
  description?: string | null
  created_at?: string
  updated_at?: string
}

export interface CreateWarehouseRequest {
  name: string
  address: string
  description?: string
}

export interface UpdateWarehouseRequest {
  name?: string
  address?: string
  description?: string
}

// ============================================================================
// SHOP TYPES
// ============================================================================
export interface Shop {
  id: string
  name: string
  address: string
  description?: string | null
  created_at?: string
  updated_at?: string
}

export interface CreateShopRequest {
  name: string
  address: string
  description?: string
}

export interface UpdateShopRequest {
  name?: string
  address?: string
  description?: string
}

// ============================================================================
// STOCK TYPES
// ============================================================================
export interface StockSnapshot {
  id: string
  product: {
    id: string
    name: string
    sku: string
    description?: string
    category_id: string
    brand_id?: string
    unit_id?: string
    base_price?: number
    created_at?: string
    updated_at?: string
  }
  warehouse?: Warehouse | null
  shop?: Shop | null
  quantity: string
  onHand?: number
  reserved?: number
  available?: number
}

export interface StockAvailable {
  onHand: number
  reserved: number
  available: number
}

// ============================================================================
// TRANSFER TYPES
// ============================================================================
export type LocationType = "warehouse" | "shop"

export interface StockTransfer {
  id: string
  product: {
    id: string
    name: string
  }
  fromWarehouse?: Warehouse | null
  toWarehouse?: Warehouse | null
  fromShop?: Shop | null
  toShop?: Shop | null
  quantity: string
  direction: string
  reason: string
  relatedType?: string | null
  relatedId?: string | null
  createdBy?: string | null
  createdAt: string
  updatedAt?: string
}

export interface CreateStockTransferRequest {
  productId: string
  fromLocationType: LocationType
  fromLocationId: string
  toLocationType: LocationType
  toLocationId: string
  quantity: string
  reason: string
}

// ============================================================================
// ADJUSTMENT TYPES
// ============================================================================
export type AdjustmentDirection = "in" | "out"

export interface StockAdjustment {
  id: string
  product: {
    id: string
    name: string
  }
  fromWarehouse?: Warehouse | null
  toWarehouse?: Warehouse | null
  fromShop?: Shop | null
  toShop?: Shop | null
  quantity: string
  direction: AdjustmentDirection
  reason: string
  relatedType?: string
  relatedId?: string | null
  createdBy?: string | null
  createdAt: string
  updatedAt?: string
  beforeQuantity?: number
  afterQuantity?: number
}

export interface CreateStockAdjustmentRequest {
  productId: string
  locationType: LocationType
  locationId: string
  direction: AdjustmentDirection
  quantity: string
  reason: string
}

// ============================================================================
// RESERVATION TYPES
// ============================================================================
export type ReservationStatus = "active" | "released" | "consumed"

export interface StockReservation {
  id: string
  product: {
    id: string
    name: string
  }
  warehouse?: Warehouse | null
  shop?: Shop | null
  salesOrderId: string
  quantity: string
  status: ReservationStatus
  createdAt: string
  updatedAt: string
}

export interface CreateStockReservationRequest {
  productId: string
  warehouseId?: string
  shopId?: string
  salesOrderId: string
  quantity: string
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================
export type TransactionDirection = "in" | "out" | "transfer"

export interface StockTransaction {
  id: string
  product: {
    id: string
    name: string
  }
  fromWarehouse?: Warehouse | null
  toWarehouse?: Warehouse | null
  fromShop?: Shop | null
  toShop?: Shop | null
  quantity: string
  direction: TransactionDirection
  reason: string
  relatedType?: string
  relatedId?: string | null
  createdBy?: string | null
  createdAt: string
  updatedAt?: string
}

// ============================================================================
// PAGINATED RESPONSE
// ============================================================================
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}
