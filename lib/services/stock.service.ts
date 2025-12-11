import type {
  StockSnapshot,
  StockAvailable,
  CreateStockTransferRequest,
  StockTransfer,
  CreateStockAdjustmentRequest,
  StockAdjustment,
  CreateStockReservationRequest,
  StockReservation,
} from "@/lib/types/inventory"
import { axiosInstance } from "@/lib/api/axios-instance"

// ============================================================================
// MOCK DATA - Stock snapshots showing quantities at each location
// ============================================================================
const MOCK_STOCK: StockSnapshot[] = [
  {
    id: "stock-1",
    product: {
      id: "1",
      name: 'MacBook Pro 16"',
      sku: "MBP-16-001",
      description: "High-performance laptop for professionals with M3 Pro chip",
      category_id: "2",
      brand_id: "1",
      unit_id: "1",
      base_price: 2499.99,
    },
    warehouse: {
      id: "3b0af3c9-d927-4b41-8a17-f83b152b1f1e",
      name: "Addis Central Warehouse",
      address: "Bole, Addis Ababa",
      description: "Main distribution hub",
    },
    quantity: "80",
    onHand: 80,
    reserved: 10,
    available: 70,
  },
  {
    id: "stock-2",
    product: {
      id: "2",
      name: "iPhone 15 Pro",
      sku: "IPH-15P-001",
      description: "Latest flagship smartphone with A17 Pro chip",
      category_id: "3",
      brand_id: "1",
      unit_id: "1",
      base_price: 999.99,
    },
    warehouse: {
      id: "3b0af3c9-d927-4b41-8a17-f83b152b1f1e",
      name: "Addis Central Warehouse",
      address: "Bole, Addis Ababa",
      description: "Main distribution hub",
    },
    quantity: "150",
    onHand: 150,
    reserved: 25,
    available: 125,
  },
  {
    id: "stock-3",
    product: {
      id: "1",
      name: 'MacBook Pro 16"',
      sku: "MBP-16-001",
      description: "High-performance laptop for professionals with M3 Pro chip",
      category_id: "2",
      brand_id: "1",
      unit_id: "1",
      base_price: 2499.99,
    },
    shop: {
      id: "fc845e2f-556e-4a94-b67f-3e3b7ec8c234",
      name: "Piassa Retail Shop",
      address: "Piassa, Addis Ababa",
      description: "High-traffic retail branch",
    },
    quantity: "15",
    onHand: 15,
    reserved: 3,
    available: 12,
  },
  {
    id: "stock-4",
    product: {
      id: "2",
      name: "iPhone 15 Pro",
      sku: "IPH-15P-001",
      description: "Latest flagship smartphone with A17 Pro chip",
      category_id: "3",
      brand_id: "1",
      unit_id: "1",
      base_price: 999.99,
    },
    shop: {
      id: "fc845e2f-556e-4a94-b67f-3e3b7ec8c234",
      name: "Piassa Retail Shop",
      address: "Piassa, Addis Ababa",
      description: "High-traffic retail branch",
    },
    quantity: "45",
    onHand: 45,
    reserved: 8,
    available: 37,
  },
]

const MOCK_TRANSFERS: StockTransfer[] = [
  {
    id: "transfer-1",
    product: { id: "1", name: 'MacBook Pro 16"' },
    fromWarehouse: {
      id: "3b0af3c9-d927-4b41-8a17-f83b152b1f1e",
      name: "Addis Central Warehouse",
      address: "Bole, Addis Ababa",
    },
    toShop: {
      id: "fc845e2f-556e-4a94-b67f-3e3b7ec8c234",
      name: "Piassa Retail Shop",
      address: "Piassa, Addis Ababa",
    },
    quantity: "5",
    direction: "transfer",
    reason: "replenish_retail_stock",
    createdAt: "2025-12-10T06:15:45.182Z",
  },
]

const MOCK_ADJUSTMENTS: StockAdjustment[] = [
  {
    id: "adj-1",
    product: { id: "1", name: 'MacBook Pro 16"' },
    toWarehouse: {
      id: "3b0af3c9-d927-4b41-8a17-f83b152b1f1e",
      name: "Addis Central Warehouse",
      address: "Bole, Addis Ababa",
    },
    quantity: "25",
    direction: "in",
    reason: "year_end_reconciliation",
    beforeQuantity: 55,
    afterQuantity: 80,
    createdAt: "2025-12-10T06:18:12.334Z",
  },
]

const MOCK_RESERVATIONS: StockReservation[] = [
  {
    id: "res-1",
    product: { id: "1", name: 'MacBook Pro 16"' },
    warehouse: {
      id: "3b0af3c9-d927-4b41-8a17-f83b152b1f1e",
      name: "Addis Central Warehouse",
      address: "Bole, Addis Ababa",
    },
    salesOrderId: "95a1894b-4c66-461b-b988-71988db7b1c8",
    quantity: "10",
    status: "active",
    createdAt: "2025-12-10T06:20:43.538Z",
    updatedAt: "2025-12-10T06:20:43.538Z",
  },
]

class StockService {
  // ============================================================================
  // PRODUCTION API METHODS (currently active)
  // ============================================================================

  async getStockSnapshot(params?: { productId?: string; warehouseId?: string; shopId?: string }): Promise<
    StockSnapshot[]
  > {
    const response = await axiosInstance.get<StockSnapshot[]>("/stock", { params })
    return response.data
  }

  async getAvailableStock(productId: string, warehouseId?: string): Promise<StockAvailable> {
    const response = await axiosInstance.get<StockAvailable>("/stock/available", {
      params: { productId, warehouseId },
    })
    console.log("ggg:", response.data)
    return response.data
  }

  async createTransfer(data: CreateStockTransferRequest): Promise<StockTransfer> {
    const response = await axiosInstance.post<StockTransfer>("//stock/transfer", data)
    return response.data
  }

  async createAdjustment(data: CreateStockAdjustmentRequest): Promise<StockAdjustment> {
    const response = await axiosInstance.post<StockAdjustment>("/stock/adjust", data)
    return response.data
  }

  async createReservation(data: CreateStockReservationRequest): Promise<StockReservation> {
    const response = await axiosInstance.post<StockReservation>("/stock/reservations", data)
    return response.data
  }

  async getReservations(params?: { status?: string }): Promise<StockReservation[]> {
    const response = await axiosInstance.get<StockReservation[]>("/stock/reservations", { params })
    return response.data
  }

  async getAdjustments(): Promise<StockAdjustment[]> {
    const response = await axiosInstance.get<StockAdjustment[]>("/stock-transactions", {
      params: { relatedType: "adjustment" },
    })
    return response.data
  }

  async releaseReservation(id: string): Promise<void> {
    await axiosInstance.post(`/stock/reservations/release`, { reservationId: id, })
  }

  async consumeReservation(id: string): Promise<void> {
    await axiosInstance.post(`/stock/reservations/consume`, { reservationId: id, })
  }

  async getStockByLocation(locationType: "warehouse" | "shop", locationId: string): Promise<StockSnapshot[]> {
    const params = locationType === "warehouse" ? { warehouseId: locationId } : { shopId: locationId }
    const response = await axiosInstance.get<StockSnapshot[]>("/stock", { params })
    return response.data
  }

  // ============================================================================
  // MOCK METHODS (comment out when using real API)
  // ============================================================================

  /*
  async getStockSnapshot(params?: {
    productId?: string
    warehouseId?: string
    shopId?: string
  }): Promise<StockSnapshot[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filtered = [...MOCK_STOCK]

    if (params?.productId) {
      filtered = filtered.filter((s) => s.product.id === params.productId)
    }
    if (params?.warehouseId) {
      filtered = filtered.filter((s) => s.warehouse?.id === params.warehouseId)
    }
    if (params?.shopId) {
      filtered = filtered.filter((s) => s.shop?.id === params.shopId)
    }

    return filtered
  }

  async getAvailableStock(productId: string, warehouseId?: string): Promise<StockAvailable> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const stock = MOCK_STOCK.find(
      (s) => s.product.id === productId && (warehouseId ? s.warehouse?.id === warehouseId : s.warehouse),
    )

    return {
      onHand: stock?.onHand || 0,
      reserved: stock?.reserved || 0,
      available: stock?.available || 0,
    }
  }

  async createTransfer(data: CreateStockTransferRequest): Promise<StockTransfer> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const product = await productService.getProduct(data.productId)
    const fromLocation =
      data.fromLocationType === "warehouse"
        ? await warehouseService.getWarehouse(data.fromLocationId)
        : await shopService.getShop(data.fromLocationId)
    const toLocation =
      data.toLocationType === "warehouse"
        ? await warehouseService.getWarehouse(data.toLocationId)
        : await shopService.getShop(data.toLocationId)

    const transfer: StockTransfer = {
      id: `transfer-${Date.now()}`,
      product: { id: product?.id || "", name: product?.name || "" },
      ...(data.fromLocationType === "warehouse" && { fromWarehouse: fromLocation }),
      ...(data.fromLocationType === "shop" && { fromShop: fromLocation }),
      ...(data.toLocationType === "warehouse" && { toWarehouse: toLocation }),
      ...(data.toLocationType === "shop" && { toShop: toLocation }),
      quantity: data.quantity,
      direction: "transfer",
      reason: data.reason,
      createdAt: new Date().toISOString(),
    }

    MOCK_TRANSFERS.push(transfer)
    return transfer
  }

  async createAdjustment(data: CreateStockAdjustmentRequest): Promise<StockAdjustment> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const product = await productService.getProduct(data.productId)
    const location =
      data.locationType === "warehouse"
        ? await warehouseService.getWarehouse(data.locationId)
        : await shopService.getShop(data.locationId)

    const adjustment: StockAdjustment = {
      id: `adj-${Date.now()}`,
      product: { id: product?.id || "", name: product?.name || "" },
      ...(data.locationType === "warehouse" && { toWarehouse: location }),
      ...(data.locationType === "shop" && { toShop: location }),
      quantity: data.quantity,
      direction: data.direction,
      reason: data.reason,
      relatedType: "adjustment",
      createdAt: new Date().toISOString(),
    }

    MOCK_ADJUSTMENTS.push(adjustment)
    return adjustment
  }

  async createReservation(data: CreateStockReservationRequest): Promise<StockReservation> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const product = await productService.getProduct(data.productId)
    const warehouse = data.warehouseId ? await warehouseService.getWarehouse(data.warehouseId) : null
    const shop = data.shopId ? await shopService.getShop(data.shopId) : null

    const reservation: StockReservation = {
      id: `res-${Date.now()}`,
      product: { id: product?.id || "", name: product?.name || "" },
      warehouse,
      shop,
      salesOrderId: data.salesOrderId,
      quantity: data.quantity,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    MOCK_RESERVATIONS.push(reservation)
    return reservation
  }

  async getReservations(params?: { status?: string }): Promise<StockReservation[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    let filtered = [...MOCK_RESERVATIONS]

    if (params?.status) {
      filtered = filtered.filter((r) => r.status === params.status)
    }

    return filtered
  }

  async releaseReservation(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const reservation = MOCK_RESERVATIONS.find((r) => r.id === id)
    if (reservation) {
      reservation.status = "released"
      reservation.updatedAt = new Date().toISOString()
    }
  }

  async consumeReservation(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const reservation = MOCK_RESERVATIONS.find((r) => r.id === id)
    if (reservation) {
      reservation.status = "consumed"
      reservation.updatedAt = new Date().toISOString()
    }
  }

  async getStockByLocation(locationType: "warehouse" | "shop", locationId: string): Promise<StockSnapshot[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (locationType === "warehouse") {
      return MOCK_STOCK.filter((s) => s.warehouse?.id === locationId)
    } else {
      return MOCK_STOCK.filter((s) => s.shop?.id === locationId)
    }
  }

  // The real API uses getStockSnapshot() which returns plain arrays, not paginated responses
  */
}

export const stockService = new StockService()
