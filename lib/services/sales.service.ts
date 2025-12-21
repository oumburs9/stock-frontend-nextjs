import { axiosInstance } from "@/lib/api/axios-instance"
import type {
  PricingRule,
  CreatePricingRuleRequest,
  UpdatePricingRuleRequest,
  PriceQuote,
  SalesOrder,
  SalesOrderItem,
  CreateSalesOrderRequest,
  UpdateSalesOrderRequest,
  AddSalesOrderItemRequest,
  UpdateSalesOrderItemRequest,
  StockReservation,
  CreateReservationRequest,
} from "@/lib/types/sales"

const USE_MOCK_DATA = false

// ===== MOCK DATA =====
const mockPricingRules: PricingRule[] = [
  {
    id: "rule-1",
    name: "Default 20% Margin",
    description: "Standard margin for all products",
    target_type: "all",
    target_product_id: null,
    target_category_id: null,
    target_brand_id: null,
    margin_percent: "20.00",
    fixed_price: null,
    is_active: true,
    valid_from: null,
    valid_to: null,
    created_at: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "rule-2",
    name: "Premium Products 30% Margin",
    description: "Higher margin for premium category",
    target_type: "category",
    target_product_id: null,
    target_category_id: "cat-premium",
    target_brand_id: null,
    margin_percent: "30.00",
    fixed_price: null,
    is_active: true,
    valid_from: null,
    valid_to: null,
    created_at: "2025-01-02T00:00:00.000Z",
  },
]

const mockSalesOrders: SalesOrder[] = [
  {
    id: "so-1",
    code: "SO-1736500000000",
    customer_id: "1",
    warehouse_id: "1",
    shop_id: null,
    status: "draft",
    order_date: "2025-01-10",
    currency: "ETB",
    payment_terms: "cash",
    notes: "Retail sale from warehouse",
    created_at: "2025-01-10T09:00:00.000Z",
    updated_at: "2025-01-10T09:00:00.000Z",
    items: [
      {
        id: "item-1",
        sales_order_id: "so-1",
        product_id: "1",
        quantity: "2",
        list_price: "150000.000000",
        unit_price: "150000.000000",
        discount_amount: "0",
        discount_percent: "0",
        pricing_rule_id: "rule-1",
        total_price: "300000.0000",
      },
    ],
  },
  {
    id: "so-2",
    code: "SO-1736500001000",
    customer_id: "2",
    warehouse_id: null,
    shop_id: "1",
    status: "confirmed",
    order_date: "2025-01-11",
    currency: "ETB",
    payment_terms: "credit",
    notes: "Shop sale with discount",
    created_at: "2025-01-11T10:00:00.000Z",
    updated_at: "2025-01-11T10:30:00.000Z",
    items: [
      {
        id: "item-2",
        sales_order_id: "so-2",
        product_id: "2",
        quantity: "1",
        list_price: "250000.000000",
        unit_price: "240000.000000",
        discount_amount: "10000",
        discount_percent: "0",
        pricing_rule_id: "rule-2",
        total_price: "240000.0000",
      },
    ],
  },
]

const mockReservations: StockReservation[] = [
  {
    id: "res-1",
    product_id: "1",
    warehouse_id: "1",
    shop_id: null,
    quantity: "2",
    sales_order_id: "so-2",
    status: "active",
    created_at: "2025-01-11T10:30:00.000Z",
  },
]

// ===== SERVICES =====

class PricingService {
  async getPricingRules(): Promise<PricingRule[]> {
    if (USE_MOCK_DATA) {
      return Promise.resolve([...mockPricingRules])
    }

    const response = await axiosInstance.get<PricingRule[]>("/sales/pricing/rules")
    return response.data
  }

  async getPricingRule(id: string): Promise<PricingRule> {
    if (USE_MOCK_DATA) {
      const rule = mockPricingRules.find((r) => r.id === id)
      if (!rule) throw new Error("Pricing rule not found")
      return Promise.resolve(rule)
    }

    const response = await axiosInstance.get<PricingRule>(`/sales/pricing/rules/${id}`)
    return response.data
  }

  async createPricingRule(data: CreatePricingRuleRequest): Promise<PricingRule> {
    if (USE_MOCK_DATA) {
      const newRule: PricingRule = {
        id: crypto.randomUUID(),
        name: data.name,
        description: data.description || null,
        target_type: data.targetType,
        target_product_id: data.targetProductId || null,
        target_category_id: data.targetCategoryId || null,
        target_brand_id: data.targetBrandId || null,
        margin_percent: data.marginPercent || null,
        fixed_price: data.fixedPrice || null,
        is_active: true,
        valid_from: data.validFrom || null,
        valid_to: data.validTo || null,
        created_at: new Date().toISOString(),
      }
      mockPricingRules.push(newRule)
      return Promise.resolve(newRule)
    }

    const response = await axiosInstance.post<PricingRule>("/sales/pricing/rules", data)
    return response.data
  }

  async updatePricingRule(id: string, data: UpdatePricingRuleRequest): Promise<PricingRule> {
    if (USE_MOCK_DATA) {
      const index = mockPricingRules.findIndex((r) => r.id === id)
      if (index === -1) throw new Error("Pricing rule not found")

      mockPricingRules[index] = {
        ...mockPricingRules[index],
        ...data,
        is_active: data.isActive !== undefined ? data.isActive : mockPricingRules[index].is_active,
        margin_percent: data.marginPercent !== undefined ? data.marginPercent : mockPricingRules[index].margin_percent,
        fixed_price: data.fixedPrice !== undefined ? data.fixedPrice : mockPricingRules[index].fixed_price,
        valid_from: data.validFrom !== undefined ? data.validFrom : mockPricingRules[index].valid_from,
        valid_to: data.validTo !== undefined ? data.validTo : mockPricingRules[index].valid_to,
      }

      return Promise.resolve(mockPricingRules[index])
    }

    const response = await axiosInstance.patch<PricingRule>(`/sales/pricing/rules/${id}`, data)
    return response.data
  }

  async deletePricingRule(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      const index = mockPricingRules.findIndex((r) => r.id === id)
      if (index === -1) throw new Error("Pricing rule not found")
      mockPricingRules.splice(index, 1)
      return Promise.resolve()
    }

    await axiosInstance.delete(`/sales/pricing/rules/${id}`)
  }

  async quotePrice(productId: string, asOfDate?: string): Promise<PriceQuote> {
    if (USE_MOCK_DATA) {
      // Simulate pricing calculation
      const unitCost = "120000.000000"
      const rule = mockPricingRules.find((r) => r.is_active && r.target_type === "all")

      if (rule && rule.margin_percent) {
        const marginMultiplier = 1 + Number.parseFloat(rule.margin_percent) / 100
        const listPrice = (Number.parseFloat(unitCost) * marginMultiplier).toFixed(6)

        return Promise.resolve({
          listPrice,
          costBasis: "product_batch_landed_cost",
          pricingRuleId: rule.id,
          appliedMarginPercent: rule.margin_percent,
          unitCost,
        })
      }

      return Promise.resolve({
        listPrice: unitCost,
        costBasis: "product_batch_landed_cost",
        pricingRuleId: null,
        appliedMarginPercent: null,
        unitCost,
      })
    }

    const params = asOfDate ? { asOfDate } : {}
    const response = await axiosInstance.get<PriceQuote>(`/sales/pricing/quote/${productId}`, { params })
    return response.data
  }
}

class SalesOrderService {
  async getSalesOrders(params?: { q?: string; status?: string }): Promise<SalesOrder[]> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockSalesOrders]

      if (params?.q) {
        const search = params.q.toLowerCase()
        filtered = filtered.filter((so) => so.code.toLowerCase().includes(search))
      }

      if (params?.status) {
        filtered = filtered.filter((so) => so.status === params.status)
      }

      return Promise.resolve(filtered)
    }

    const response = await axiosInstance.get<SalesOrder[]>("/sales/orders", { params })
    return response.data
  }

  async getSalesOrder(id: string): Promise<SalesOrder> {
    if (USE_MOCK_DATA) {
      const order = mockSalesOrders.find((so) => so.id === id)
      if (!order) throw new Error("Sales order not found")
      return Promise.resolve(order)
    }

    const response = await axiosInstance.get<SalesOrder>(`/sales/orders/${id}`)
    return response.data
  }

  async createSalesOrder(data: CreateSalesOrderRequest): Promise<SalesOrder> {
    if (USE_MOCK_DATA) {
      const newOrder: SalesOrder = {
        id: crypto.randomUUID(),
        code: `SO-${Date.now()}`,
        customer_id: data.customerId,
        warehouse_id: data.warehouseId || null,
        shop_id: data.shopId || null,
        status: "draft",
        order_date: data.orderDate,
        currency: data.currency || "ETB",
        payment_terms: data.paymentTerms || "cash",
        notes: data.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: [],
      }
      mockSalesOrders.push(newOrder)
      return Promise.resolve(newOrder)
    }

    const response = await axiosInstance.post<SalesOrder>("/sales/orders", data)
    return response.data
  }

  async updateSalesOrder(id: string, data: UpdateSalesOrderRequest): Promise<SalesOrder> {
    if (USE_MOCK_DATA) {
      const index = mockSalesOrders.findIndex((so) => so.id === id)
      if (index === -1) throw new Error("Sales order not found")

      mockSalesOrders[index] = {
        ...mockSalesOrders[index],
        customer_id: data.customerId || mockSalesOrders[index].customer_id,
        warehouse_id: data.warehouseId !== undefined ? data.warehouseId : mockSalesOrders[index].warehouse_id,
        shop_id: data.shopId !== undefined ? data.shopId : mockSalesOrders[index].shop_id,
        order_date: data.orderDate || mockSalesOrders[index].order_date,
        currency: data.currency || mockSalesOrders[index].currency,
        payment_terms: data.paymentTerms || mockSalesOrders[index].payment_terms,
        notes: data.notes !== undefined ? data.notes : mockSalesOrders[index].notes,
        updated_at: new Date().toISOString(),
      }

      return Promise.resolve(mockSalesOrders[index])
    }

    const response = await axiosInstance.patch<SalesOrder>(`/sales/orders/${id}`, data)
    return response.data
  }

  async addSalesOrderItem(orderId: string, data: AddSalesOrderItemRequest): Promise<SalesOrderItem> {
    if (USE_MOCK_DATA) {
      const order = mockSalesOrders.find((so) => so.id === orderId)
      if (!order) throw new Error("Sales order not found")

      // Simulate pricing if not provided
      const listPrice = "150000.000000"
      const unitPrice = data.unitPrice || listPrice

      const newItem: SalesOrderItem = {
        id: crypto.randomUUID(),
        sales_order_id: orderId,
        product_id: data.productId,
        quantity: data.quantity,
        list_price: listPrice,
        unit_price: unitPrice,
        discount_amount: data.discountAmount || "0",
        discount_percent: data.discountPercent || "0",
        pricing_rule_id: "rule-1",
        total_price: (Number.parseFloat(data.quantity) * Number.parseFloat(unitPrice)).toFixed(4),
      }

      if (!order.items) order.items = []
      order.items.push(newItem)

      return Promise.resolve(newItem)
    }

    const response = await axiosInstance.post<SalesOrderItem>(`/sales/orders/${orderId}/items`, data)
    return response.data
  }

  async updateSalesOrderItem(
    orderId: string,
    itemId: string,
    data: UpdateSalesOrderItemRequest,
  ): Promise<SalesOrderItem> {
    if (USE_MOCK_DATA) {
      const order = mockSalesOrders.find((so) => so.id === orderId)
      if (!order || !order.items) throw new Error("Sales order not found")

      const itemIndex = order.items.findIndex((item) => item.id === itemId)
      if (itemIndex === -1) throw new Error("Sales order item not found")

      const item = order.items[itemIndex]
      item.quantity = data.quantity || item.quantity
      item.unit_price = data.unitPrice || item.unit_price
      item.discount_amount = data.discountAmount !== undefined ? data.discountAmount : item.discount_amount
      item.discount_percent = data.discountPercent !== undefined ? data.discountPercent : item.discount_percent
      item.total_price = (Number.parseFloat(item.quantity) * Number.parseFloat(item.unit_price)).toFixed(4)

      order.items[itemIndex] = item
      return Promise.resolve(item)
    }

    const response = await axiosInstance.patch<SalesOrderItem>(`/sales/orders/${orderId}/items/${itemId}`, data)
    return response.data
  }

  async confirmSalesOrder(id: string): Promise<SalesOrder> {
    if (USE_MOCK_DATA) {
      const order = mockSalesOrders.find((so) => so.id === id)
      if (!order) throw new Error("Sales order not found")
      if (order.status !== "draft") throw new Error("Only draft orders can be confirmed")
      if (!order.items || order.items.length === 0) throw new Error("Cannot confirm a sales order without items")

      order.status = "confirmed"
      order.updated_at = new Date().toISOString()

      return Promise.resolve(order)
    }

    const response = await axiosInstance.post<SalesOrder>(`/sales/orders/${id}/confirm`)
    return response.data
  }

  async deliverSalesOrder(id: string): Promise<SalesOrder> {
    if (USE_MOCK_DATA) {
      const order = mockSalesOrders.find((so) => so.id === id)
      if (!order) throw new Error("Sales order not found")
      if (!["confirmed", "reserved", "partially_delivered"].includes(order.status)) {
        throw new Error("Order cannot be delivered in current status")
      }

      order.status = "delivered"
      order.updated_at = new Date().toISOString()

      return Promise.resolve(order)
    }

    const response = await axiosInstance.post<SalesOrder>(`/sales/orders/${id}/deliver`)
    console.log("res:", response.data)
    return response.data
  }

  async cancelSalesOrder(id: string): Promise<SalesOrder> {
    if (USE_MOCK_DATA) {
      const order = mockSalesOrders.find((so) => so.id === id)
      if (!order) throw new Error("Sales order not found")
      if (order.status === "delivered") throw new Error("Delivered orders cannot be cancelled")

      order.status = "cancelled"
      order.updated_at = new Date().toISOString()

      return Promise.resolve(order)
    }

    const response = await axiosInstance.post<SalesOrder>(`/sales/orders/${id}/cancel`)
    return response.data
  }

  async deleteSalesOrderItem(orderId: string, itemId: string): Promise<void> {
    if (USE_MOCK_DATA) {
      const order = mockSalesOrders.find((so) => so.id === orderId)
      if (!order) throw new Error("Sales order not found")
      if (!order.items) throw new Error("Sales order item not found")

      // Check if deletion is allowed based on status
      if (order.status === "partially_delivered" || order.status === "delivered") {
        throw new Error("Cannot remove item from delivered sales order")
      }

      const itemIndex = order.items.findIndex((item) => item.id === itemId)
      if (itemIndex === -1) throw new Error("Sales order item not found")

      // If order is reserved, release any stock reservations for this item
      if (order.status === "reserved") {
        const itemReservations = mockReservations.filter((r) => r.sales_order_id === orderId && r.status === "active")
        itemReservations.forEach((res) => {
          res.status = "released"
        })
      }

      // Remove the item
      order.items.splice(itemIndex, 1)
      order.updated_at = new Date().toISOString()

      return Promise.resolve()
    }

    await axiosInstance.delete(`/sales/orders/${orderId}/items/${itemId}`)
  }
}

class StockReservationService {
  async getReservations(params?: { salesOrderId?: string }): Promise<StockReservation[]> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockReservations]

      if (params?.salesOrderId) {
        filtered = filtered.filter((r) => r.sales_order_id === params.salesOrderId)
      }

      return Promise.resolve(filtered)
    }

    const response = await axiosInstance.get<StockReservation[]>("/stock/reservations", { params })
    return response.data
  }

  async createReservation(data: CreateReservationRequest): Promise<StockReservation> {
    if (USE_MOCK_DATA) {
      const newReservation: StockReservation = {
        id: crypto.randomUUID(),
        product_id: data.productId,
        warehouse_id: data.warehouseId || null,
        shop_id: data.shopId || null,
        quantity: data.quantity,
        sales_order_id: data.salesOrderId || null,
        status: "active",
        created_at: new Date().toISOString(),
      }
      mockReservations.push(newReservation)
      return Promise.resolve(newReservation)
    }

    const response = await axiosInstance.post<StockReservation>("/stock/reservations", data)
    return response.data
  }

  async releaseReservation(reservationId: string): Promise<StockReservation> {
    if (USE_MOCK_DATA) {
      const reservation = mockReservations.find((r) => r.id === reservationId)
      if (!reservation) throw new Error("Reservation not found")
      if (reservation.status !== "active") throw new Error("Only active reservations can be released")

      reservation.status = "released"
      return Promise.resolve(reservation)
    }

    const response = await axiosInstance.post<StockReservation>("/stock/reservations/release", { reservationId })
    return response.data
  }

  async consumeReservation(reservationId: string): Promise<StockReservation> {
    if (USE_MOCK_DATA) {
      const reservation = mockReservations.find((r) => r.id === reservationId)
      if (!reservation) throw new Error("Reservation not found")
      if (reservation.status !== "active") throw new Error("Only active reservations can be consumed")

      reservation.status = "consumed"
      return Promise.resolve(reservation)
    }

    const response = await axiosInstance.post<StockReservation>("/stock/reservations/consume", { reservationId })
    return response.data
  }
}

export const pricingService = new PricingService()
export const salesOrderService = new SalesOrderService()
export const stockReservationService = new StockReservationService()
