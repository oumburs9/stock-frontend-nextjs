import { axiosInstance } from "../api/axios-instance"
import type {
  ExpenseType,
  CreateExpenseTypeRequest,
  UpdateExpenseTypeRequest,
  PurchaseOrder,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  ReceivePurchaseOrderRequest,
  ReceivePurchaseOrderResponse,
  PurchaseShipment,
  CreateShipmentRequest,
  UpdateShipmentRequest,
  AddShipmentExpenseRequest,
  ReceiveShipmentRequest,
  ReceiveShipmentResponse,
  ShipmentExpense,
  Batch,
  BatchExpense,
  AddBatchExpenseRequest,
  ShipmentExpenseAdjustment,
  CreateShipmentExpenseAdjustmentRequest,
  BatchExpenseAdjustment,
  CreateBatchExpenseAdjustmentRequest,
} from "@/lib/types/purchase"

const USE_MOCK_DATA = false

// ===== MOCK DATA =====
const mockExpenseTypes: ExpenseType[] = [
  {
    id: "a1234567-89ab-cdef-0123-456789abcdef",
    code: "FREIGHT",
    name: "Freight Charges",
    scope: "shipment",
    is_active: true,
    capitalizable: true,
    default_allocation_method: null,
  },
  {
    id: "b2345678-90bc-def0-1234-56789abcdef0",
    code: "CUSTOMS",
    name: "Customs Duty",
    scope: "shipment",
    is_active: true,
    capitalizable: true,
    default_allocation_method: null,
  },
  {
    id: "c3456789-01cd-ef01-2345-6789abcdef01",
    code: "INSURANCE",
    name: "Insurance",
    scope: "batch",
    is_active: true,
    capitalizable: true,
    default_allocation_method: null,
  },
]

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: "b0c1d2e3-f4a5-4678-9123-abcdefabcdef",
    code: "PO-2025-001",
    supplier_id: "8a08ac84-4748-4a59-8fd6-174c54116c11",
    status: "draft",
    order_date: "2025-01-10",
    expected_date: "2025-01-20",
    currency: "ETB",
    notes: "Initial order for new products",
    created_at: "2025-12-13T10:00:00.000Z",
    updated_at: "2025-12-13T10:00:00.000Z",
    items: [
      {
        id: "3c3f7a0f-b2d0-4df4-9a9c-5e2b3c4d5e6f",
        purchase_order_id: "b0c1d2e3-f4a5-4678-9123-abcdefabcdef",
        product_id: "91136df1-860f-4243-9ce8-f1dc2739a75a",
        quantity: "100.00",
        unit_price: "150.00",
        unit_id: null,
        total_price: "15000.00",
      },
      {
        id: "4d4f8b1f-c3e1-5ef5-0b0d-6f3c4d5e6f7g",
        purchase_order_id: "b0c1d2e3-f4a5-4678-9123-abcdefabcdef",
        product_id: "1771c2cb-a39d-4d39-b939-b87bd2e35852",
        quantity: "200.00",
        unit_price: "75.00",
        unit_id: null,
        total_price: "15000.00",
      },
    ],
  },
  {
    id: "c1d2e3f4-g5b6-5789-0234-bcdefbcdefgh",
    code: "PO-2025-002",
    supplier_id: "8a08ac84-4748-4a59-8fd6-174c54116c11",
    status: "approved",
    order_date: "2025-01-12",
    expected_date: "2025-01-25",
    currency: "ETB",
    notes: "Urgent delivery required",
    created_at: "2025-12-13T11:00:00.000Z",
    updated_at: "2025-12-13T11:30:00.000Z",
    items: [
      {
        id: "5e5f9c2f-d4f2-6fg6-1c1e-7g4d5f6g7h8i",
        purchase_order_id: "c1d2e3f4-g5b6-5789-0234-bcdefbcdefgh",
        product_id: "1771c2cb-a39d-4d39-b939-b87bd2e35852",
        quantity: "400.00",
        unit_price: "68.00",
        unit_id: null,
        total_price: "27200.00",
      },
    ],
  },
  {
    id: "d2e3f4g5-h6c7-6890-1345-cdefgcdefghi",
    code: "PO-2025-003",
    supplier_id: "8a08ac84-4748-4a59-8fd6-174c54116c11",
    status: "received",
    order_date: "2025-01-05",
    expected_date: "2025-01-15",
    currency: "USD",
    notes: "Already fully received",
    created_at: "2025-12-10T10:00:00.000Z",
    updated_at: "2025-12-15T14:30:00.000Z",
    items: [
      {
        id: "6f6g0d3g-e5g3-7gh7-2d2f-8h5e6g7h8i9j",
        purchase_order_id: "d2e3f4g5-h6c7-6890-1345-cdefgcdefghi",
        product_id: "91136df1-860f-4243-9ce8-f1dc2739a75a",
        quantity: "50.00",
        unit_price: "120.00",
        unit_id: null,
        total_price: "6000.00",
      },
    ],
  },
]

const mockShipments: PurchaseShipment[] = [
  {
    id: "ship-001",
    code: "BL-2024-001",
    type: "import",
    status: "draft",
    supplier_id: "1",
    receiving_warehouse_id: null,
    receiving_shop_id: null,
    departure_date: null,
    arrival_date: "2024-02-15",
    currency: "USD",
    exchange_rate: null,
    notes: null,
    created_at: "2025-12-13T11:00:00.000Z",
    updated_at: "2025-12-13T11:00:00.000Z",
    items: [
      {
        id: "item-1",
        shipment_id: "ship-001",
        purchase_order_item_id: null,
        product_id: "91136df1-860f-4243-9ce8-f1dc2739a75a",
        quantity_expected: "100.00",
        quantity_received: "0.00",
      },
    ],
    expenses: [],
  },
  {
    id: "ship-002",
    code: "BL-2024-002",
    type: "local",
    status: "partially_received",
    supplier_id: "2",
    receiving_warehouse_id: "cf6a5ecd-ad3e-4357-ab4c-bd65f892e002",
    receiving_shop_id: null,
    departure_date: "2024-02-01",
    arrival_date: "2024-02-10",
    currency: "USD",
    exchange_rate: "1.0",
    notes: "Partial delivery received",
    created_at: "2025-12-13T12:00:00.000Z",
    updated_at: "2025-12-13T13:00:00.000Z",
    items: [
      {
        id: "item-2",
        shipment_id: "ship-002",
        purchase_order_item_id: null,
        product_id: "1771c2cb-a39d-4d39-b939-b87bd2e35852",
        quantity_expected: "200.00",
        quantity_received: "100.00",
      },
    ],
    expenses: [
      {
        id: "exp-1",
        shipment_id: "ship-002",
        expense_type_id: null,
        type: "freight",
        amount: "500.00",
        currency: "USD",
        description: "Shipping costs",
        expense_date: "2024-02-05",
        adjustments: [
          {
            id: "adj-1",
            expense_id: "exp-1",
            adjustment_amount: "50.00",
            reason: "Fuel surcharge applied by carrier",
            created_by: "admin@example.com",
            created_at: "2024-02-08T10:00:00.000Z",
          },
          {
            id: "adj-2",
            expense_id: "exp-1",
            adjustment_amount: "-25.00",
            reason: "Discount negotiated for repeat customer",
            created_by: "admin@example.com",
            created_at: "2024-02-09T15:30:00.000Z",
          },
        ],
      },
    ],
  },
  {
    id: "ship-003",
    code: "BL-2024-003",
    type: "import",
    status: "received",
    supplier_id: "3",
    receiving_warehouse_id: "cf6a5ecd-ad3e-4357-ab4c-bd65f892e002",
    receiving_shop_id: null,
    departure_date: "2024-01-10",
    arrival_date: "2024-01-25",
    currency: "USD",
    exchange_rate: "1.0",
    notes: "Fully received",
    created_at: "2025-12-13T10:00:00.000Z",
    updated_at: "2025-12-13T14:00:00.000Z",
    items: [
      {
        id: "item-3",
        shipment_id: "ship-003",
        purchase_order_item_id: null,
        product_id: "91136df1-860f-4243-9ce8-f1dc2739a75a",
        quantity_expected: "150.00",
        quantity_received: "150.00",
      },
    ],
    expenses: [
      {
        id: "exp-2",
        shipment_id: "ship-003",
        expense_type_id: null,
        type: "customs",
        amount: "750.00",
        currency: "USD",
        description: "Customs clearance",
        expense_date: "2024-01-20",
        adjustments: [
          {
            id: "adj-3",
            expense_id: "exp-2",
            adjustment_amount: "120.00",
            reason: "Additional inspection fees required",
            created_by: "operations@example.com",
            created_at: "2024-01-22T09:15:00.000Z",
          },
        ],
      },
    ],
  },
]

const mockBatches: Batch[] = [
  {
    id: "b2222222-3333-4444-5555-666666666666",
    product_id: "91136df1-860f-4243-9ce8-f1dc2739a75a",
    shipment_id: "ship-001",
    quantity_received: "30",
    quantity_remaining: "30",
    base_unit_cost: "80",
    landed_unit_cost: "86",
    received_at: "2025-12-13T11:30:00.000Z",
    expenses: [
      {
        id: "exp-1",
        batch_id: "b2222222-3333-4444-5555-666666666666",
        expense_type_id: "freight-001",
        type: "FREIGHT",
        amount: "150.00",
        description: "Ocean freight charges",
        expense_date: "2025-12-13",
        adjustments: [
          {
            id: "adj-b1",
            expense_id: "exp-1",
            adjustment_amount: "30.00",
            reason: "Port handling fees not included in original quote",
            created_by: "warehouse@example.com",
            created_at: "2025-12-14T08:00:00.000Z",
          },
        ],
      },
      {
        id: "exp-2",
        batch_id: "b2222222-3333-4444-5555-666666666666",
        expense_type_id: "insurance-001",
        type: "INSURANCE",
        amount: "30.00",
        description: "Cargo insurance",
        expense_date: "2025-12-13",
        adjustments: [
          {
            id: "adj-b2",
            expense_id: "exp-2",
            adjustment_amount: "5.00",
            reason: "Premium increase due to high-value cargo",
            created_by: "finance@example.com",
            created_at: "2025-12-13T16:00:00.000Z",
          },
          {
            id: "adj-b3",
            expense_id: "exp-2",
            adjustment_amount: "-2.50",
            reason: "Refund for unused coverage period",
            created_by: "finance@example.com",
            created_at: "2025-12-15T10:30:00.000Z",
          },
        ],
      },
    ],
  },
  {
    id: "c3333333-4444-5555-6666-777777777777",
    product_id: "1771c2cb-a39d-4d39-b939-b87bd2e35852",
    shipment_id: "ship-001",
    quantity_received: "50",
    quantity_remaining: "45",
    base_unit_cost: "90",
    landed_unit_cost: "96",
    received_at: "2025-12-13T12:00:00.000Z",
    expenses: [
      {
        id: "exp-3",
        batch_id: "c3333333-4444-5555-6666-777777777777",
        expense_type_id: "customs-001",
        type: "CUSTOMS",
        amount: "200.00",
        description: "Import duties and customs clearance",
        expense_date: "2025-12-14",
      },
      {
        id: "exp-4",
        batch_id: "c3333333-4444-5555-6666-777777777777",
        expense_type_id: "storage-001",
        type: "STORAGE",
        amount: "100.00",
        description: "Warehouse storage fees",
        expense_date: "2025-12-14",
      },
    ],
  },
  {
    id: "d4444444-5555-6666-7777-888888888888",
    product_id: "1771c2cb-a39d-4d39-b939-b87bd2e35852",
    shipment_id: null,
    quantity_received: "60",
    quantity_remaining: "60",
    base_unit_cost: "68",
    landed_unit_cost: "68",
    received_at: "2025-12-14T09:00:00.000Z",
    expenses: [],
  },
  {
    id: "e5555555-6666-7777-8888-999999999999",
    product_id: "91136df1-860f-4243-9ce8-f1dc2739a75a",
    shipment_id: null,
    quantity_received: "50",
    quantity_remaining: "50",
    base_unit_cost: "120",
    landed_unit_cost: "120",
    received_at: "2025-12-15T14:30:00.000Z",
    expenses: [
      {
        id: "exp-5",
        batch_id: "e5555555-6666-7777-8888-999999999999",
        expense_type_id: "handling-001",
        type: "HANDLING",
        amount: "75.00",
        description: "Handling and packaging fees",
        expense_date: "2025-12-15",
      },
    ],
  },
]

const DEMO_SUPPLIER_NAMES: Record<string, string> = {
  "1": "ABC Electronics Corp",
  "2": "XYZ Component Supplies",
  "3": "Global Trading Co",
}

class ExpenseTypeService {
  async getExpenseTypes(params?: {
    q?: string
    scope?: "shipment" | "batch"
    active?: boolean
  }): Promise<ExpenseType[]> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockExpenseTypes]
      if (params?.q) {
        const search = params.q.toLowerCase()
        filtered = filtered.filter(
          (et) => et.code.toLowerCase().includes(search) || et.name.toLowerCase().includes(search),
        )
      }
      if (params?.scope) {
        filtered = filtered.filter((et) => et.scope === params.scope)
      }
      if (params?.active !== undefined) {
        filtered = filtered.filter((et) => et.is_active === params.active)
      }
      return Promise.resolve(filtered)
    }

    const response = await axiosInstance.get<ExpenseType[]>("/purchase/expense-types", { params })
    return response.data
  }

  async getExpenseType(id: string): Promise<ExpenseType> {
    if (USE_MOCK_DATA) {
      const expenseType = mockExpenseTypes.find((et) => et.id === id)
      if (!expenseType) throw new Error("Expense type not found")
      return Promise.resolve(expenseType)
    }

    const response = await axiosInstance.get<ExpenseType>(`/purchase/expense-types/${id}`)
    return response.data
  }

  async createExpenseType(data: CreateExpenseTypeRequest): Promise<ExpenseType> {
    if (USE_MOCK_DATA) {
      const newExpenseType: ExpenseType = {
        id: crypto.randomUUID(),
        ...data,
        is_active: true,
        default_allocation_method: null,
      }
      mockExpenseTypes.push(newExpenseType)
      return Promise.resolve(newExpenseType)
    }

    const response = await axiosInstance.post<ExpenseType>("/purchase/expense-types", data)
    return response.data
  }

  async updateExpenseType(id: string, data: UpdateExpenseTypeRequest): Promise<ExpenseType> {
    if (USE_MOCK_DATA) {
      const index = mockExpenseTypes.findIndex((et) => et.id === id)
      if (index === -1) throw new Error("Expense type not found")
      mockExpenseTypes[index] = { ...mockExpenseTypes[index], ...data }
      return Promise.resolve(mockExpenseTypes[index])
    }

    const response = await axiosInstance.patch<ExpenseType>(`/purchase/expense-types/${id}`, data)
    return response.data
  }

  async deleteExpenseType(id: string): Promise<void> {
    if (USE_MOCK_DATA) {
      const index = mockExpenseTypes.findIndex((et) => et.id === id)
      if (index === -1) throw new Error("Expense type not found")
      mockExpenseTypes.splice(index, 1)
      return Promise.resolve()
    }

    await axiosInstance.delete(`/purchase/expense-types/${id}`)
  }
}

class PurchaseOrderService {
  async getPurchaseOrders(params?: { q?: string; status?: string; has_batches?: boolean }): Promise<PurchaseOrder[]> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockPurchaseOrders]
      if (params?.q) {
        const search = params.q.toLowerCase()
        filtered = filtered.filter((po) => po.code.toLowerCase().includes(search))
      }
      if (params?.status) {
        filtered = filtered.filter((po) => po.status === params.status)
      }
      if (params?.has_batches) {
        const posWithBatches = new Set(mockBatches.filter((b) => b.purchase_order_id).map((b) => b.purchase_order_id))
        filtered = filtered.filter((po) => posWithBatches.has(po.id))
      }
      return Promise.resolve(filtered)
    }

    const response = await axiosInstance.get<PurchaseOrder[]>("/purchase/orders", { params })
    return response.data
  }

  async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
    if (USE_MOCK_DATA) {
      const po = mockPurchaseOrders.find((p) => p.id === id)
      if (!po) throw new Error("Purchase order not found")
      return Promise.resolve(po)
    }

    const response = await axiosInstance.get<PurchaseOrder>(`/purchase/orders/${id}`)
    return response.data
  }

  async createPurchaseOrder(data: CreatePurchaseOrderRequest): Promise<PurchaseOrder> {
    if (USE_MOCK_DATA) {
      const newPO: PurchaseOrder = {
        id: crypto.randomUUID(),
        ...data,
        status: "draft",
        expected_date: null,
        currency: "ETB",
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: data.items.map((item) => ({
          id: crypto.randomUUID(),
          purchase_order_id: crypto.randomUUID(),
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          unit_id: null,
          total_price: (Number.parseFloat(item.quantity) * Number.parseFloat(item.unit_price)).toString(),
        })),
      }
      mockPurchaseOrders.push(newPO)
      return Promise.resolve(newPO)
    }

    const response = await axiosInstance.post<PurchaseOrder>("/purchase/orders", data)
    return response.data
  }

  async updatePurchaseOrder(id: string, data: UpdatePurchaseOrderRequest): Promise<PurchaseOrder> {
    if (USE_MOCK_DATA) {
      const index = mockPurchaseOrders.findIndex((po) => po.id === id)
      if (index === -1) throw new Error("Purchase order not found")

      const updated: PurchaseOrder = {
        ...mockPurchaseOrders[index],
        notes: data.notes ?? mockPurchaseOrders[index].notes,
        updated_at: new Date().toISOString(),
      }

      if (data.items) {
        updated.items = data.items.map((item) => ({
          id: crypto.randomUUID(),
          purchase_order_id: id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          unit_id: null,
          total_price: (Number.parseFloat(item.quantity) * Number.parseFloat(item.unit_price)).toString(),
        }))
      }

      mockPurchaseOrders[index] = updated
      return Promise.resolve(updated)
    }

    const response = await axiosInstance.patch<PurchaseOrder>(`/purchase/orders/${id}`, data)
    return response.data
  }

  async approvePurchaseOrder(id: string): Promise<PurchaseOrder> {
    if (USE_MOCK_DATA) {
      const index = mockPurchaseOrders.findIndex((po) => po.id === id)
      if (index === -1) throw new Error("Purchase order not found")
      mockPurchaseOrders[index].status = "approved"
      mockPurchaseOrders[index].updated_at = new Date().toISOString()
      return Promise.resolve(mockPurchaseOrders[index])
    }

    const response = await axiosInstance.post<PurchaseOrder>(`/purchase/orders/${id}/approve`)
    return response.data
  }

  async cancelPurchaseOrder(id: string): Promise<PurchaseOrder> {
    if (USE_MOCK_DATA) {
      const index = mockPurchaseOrders.findIndex((po) => po.id === id)
      if (index === -1) throw new Error("Purchase order not found")
      mockPurchaseOrders[index].status = "cancelled"
      mockPurchaseOrders[index].updated_at = new Date().toISOString()
      return Promise.resolve(mockPurchaseOrders[index])
    }

    const response = await axiosInstance.post<PurchaseOrder>(`/purchase/orders/${id}/cancel`)
    return response.data
  }

  async receivePurchaseOrder(id: string, data: ReceivePurchaseOrderRequest): Promise<ReceivePurchaseOrderResponse> {
    if (USE_MOCK_DATA) {
      const po = mockPurchaseOrders.find((po) => po.id === id)
      if (!po) throw new Error("Purchase order not found")

      const postings = data.lines.map((line) => {
        const poItem = po.items.find((item) => item.id === line.purchase_order_item_id)
        if (!poItem) throw new Error(`PO item ${line.purchase_order_item_id} not found`)

        const newBatch: Batch = {
          id: crypto.randomUUID(),
          product_id: poItem.product_id,
          shipment_id: null,
          quantity_received: line.quantity_received,
          quantity_remaining: line.quantity_received,
          base_unit_cost: poItem.unit_price,
          landed_unit_cost: poItem.unit_price,
          received_at: new Date().toISOString(),
        }

        mockBatches.push(newBatch)

        return {
          purchase_order_item_id: line.purchase_order_item_id,
          product_id: poItem.product_id,
          received_quantity: line.quantity_received,
          location: {
            type: line.location_type,
            id: line.location_id,
          },
          batch_id: newBatch.id,
          stock_posting: {
            stockId: crypto.randomUUID(),
            txId: crypto.randomUUID(),
            beforeQuantity: "100",
            afterQuantity: (Number.parseFloat("100") + Number.parseFloat(line.quantity_received)).toString(),
          },
        }
      })

      const allFullyReceived = po.items.every((item) => {
        const totalReceived = mockBatches
          .filter((b) => b.product_id === item.product_id && !b.shipment_id)
          .reduce((sum, b) => sum + Number.parseFloat(b.quantity_received), 0)
        return totalReceived >= Number.parseFloat(item.quantity)
      })

      const index = mockPurchaseOrders.findIndex((po) => po.id === id)
      if (index !== -1) {
        mockPurchaseOrders[index].status = allFullyReceived ? "received" : "approved"
        mockPurchaseOrders[index].updated_at = new Date().toISOString()
      }

      const mockResponse: ReceivePurchaseOrderResponse = {
        purchase_order_id: id,
        status: allFullyReceived ? "received" : "partially_received",
        postings,
      }

      return Promise.resolve(mockResponse)
    }

    const response = await axiosInstance.post<ReceivePurchaseOrderResponse>(`/purchase/orders/${id}/receive`, data)
    return response.data
  }
}

class ShipmentService {
  async getShipments(params?: { q?: string; status?: string; type?: string; has_batches?: boolean }): Promise<
    PurchaseShipment[]
  > {
    if (USE_MOCK_DATA) {
      let filtered = [...mockShipments]
      if (params?.q) {
        const search = params.q.toLowerCase()
        filtered = filtered.filter((s) => s.code.toLowerCase().includes(search))
      }
      if (params?.status) {
        filtered = filtered.filter((s) => s.status === params.status)
      }
      if (params?.type) {
        filtered = filtered.filter((s) => s.type === params.type)
      }
      if (params?.has_batches) {
        const shipmentsWithBatches = new Set(mockBatches.filter((b) => b.shipment_id).map((b) => b.shipment_id))
        filtered = filtered.filter((s) => shipmentsWithBatches.has(s.id))
      }
      return Promise.resolve(filtered)
    }

    const response = await axiosInstance.get<PurchaseShipment[]>("/purchase/shipments", { params })
    return response.data
  }

  async getShipment(id: string): Promise<PurchaseShipment> {
    if (USE_MOCK_DATA) {
      const shipment = mockShipments.find((s) => s.id === id)
      if (!shipment) throw new Error("Shipment not found")
      return Promise.resolve(shipment)
    }

    const response = await axiosInstance.get<PurchaseShipment>(`/purchase/shipments/${id}`)
    return response.data
  }

  async createShipment(data: CreateShipmentRequest): Promise<PurchaseShipment> {
    if (USE_MOCK_DATA) {
      const newShipment: PurchaseShipment = {
        id: crypto.randomUUID(),
        code: data.code,
        type: data.type,
        status: "draft",
        supplier_id: data.supplier_id,
        receiving_warehouse_id: null,
        receiving_shop_id: null,
        departure_date: data.departure_date || null,
        arrival_date: data.arrival_date || null,
        currency: data.currency || "ETB",
        exchange_rate: data.exchange_rate || null,
        notes: data.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: data.items.map((item) => ({
          id: crypto.randomUUID(),
          shipment_id: "",
          purchase_order_item_id: item.purchase_order_item_id || null,
          product_id: item.product_id,
          quantity_expected: item.quantity_expected,
          quantity_received: "0.00",
        })),
        expenses: [],
      }
      newShipment.items.forEach((item) => {
        item.shipment_id = newShipment.id
      })
      mockShipments.push(newShipment)
      return Promise.resolve(newShipment)
    }

    const response = await axiosInstance.post<PurchaseShipment>("/purchase/shipments", data)
    return response.data
  }

  async updateShipment(id: string, data: UpdateShipmentRequest): Promise<PurchaseShipment> {
    if (USE_MOCK_DATA) {
      const index = mockShipments.findIndex((s) => s.id === id)
      if (index === -1) throw new Error("Shipment not found")

      if (data.arrival_date !== undefined) mockShipments[index].arrival_date = data.arrival_date
      if (data.departure_date !== undefined) mockShipments[index].departure_date = data.departure_date
      if (data.receiving_warehouse_id !== undefined) {
        mockShipments[index].receiving_warehouse_id = data.receiving_warehouse_id
        mockShipments[index].receiving_shop_id = null
      }
      if (data.receiving_shop_id !== undefined) {
        mockShipments[index].receiving_shop_id = data.receiving_shop_id
        mockShipments[index].receiving_warehouse_id = null
      }
      if (data.exchange_rate !== undefined) mockShipments[index].exchange_rate = data.exchange_rate
      if (data.notes !== undefined) mockShipments[index].notes = data.notes
      mockShipments[index].updated_at = new Date().toISOString()

      return Promise.resolve(mockShipments[index])
    }

    const response = await axiosInstance.patch<PurchaseShipment>(`/purchase/shipments/${id}`, data)
    return response.data
  }

  async addShipmentExpense(id: string, data: AddShipmentExpenseRequest): Promise<ShipmentExpense> {
    if (USE_MOCK_DATA) {
      const newExpense: ShipmentExpense = {
        id: crypto.randomUUID(),
        shipment_id: id,
        expense_type_id: null,
        type: data.type,
        amount: data.amount,
        currency: "USD",
        description: data.description ?? null,
        expense_date: new Date().toISOString().split("T")[0],
      }

      const index = mockShipments.findIndex((s) => s.id === id)
      if (index !== -1) {
        mockShipments[index].expenses.push(newExpense)
        mockShipments[index].updated_at = new Date().toISOString()
      }

      return Promise.resolve(newExpense)
    }

    const response = await axiosInstance.post<ShipmentExpense>(`/purchase/shipments/${id}/expenses`, data)
    return response.data
  }

  async receiveShipment(id: string, data: ReceiveShipmentRequest): Promise<ReceiveShipmentResponse> {
    if (USE_MOCK_DATA) {
      const postings = data.lines.flatMap((line) =>
        line.allocations.map((alloc) => ({
          shipment_item_id: line.shipment_item_id,
          product_id: "91136df1-860f-4243-9ce8-f1dc2739a75a",
          allocation: {
            type: alloc.location_type,
            id: alloc.location_id,
            quantity: alloc.quantity,
          },
          batch_id: crypto.randomUUID(),
          stock_posting: {
            stockId: crypto.randomUUID(),
            txId: crypto.randomUUID(),
            beforeQuantity: "0",
            afterQuantity: alloc.quantity,
          },
        })),
      )

      const index = mockShipments.findIndex((s) => s.id === id)
      if (index !== -1) {
        mockShipments[index].status = "partially_received"
        mockShipments[index].updated_at = new Date().toISOString()

        data.lines.forEach((line) => {
          const itemIndex = mockShipments[index].items.findIndex((item) => item.id === line.shipment_item_id)
          if (itemIndex !== -1) {
            const totalReceived = line.allocations.reduce((sum, alloc) => sum + Number.parseFloat(alloc.quantity), 0)
            const currentReceived = Number.parseFloat(mockShipments[index].items[itemIndex].quantity_received)
            mockShipments[index].items[itemIndex].quantity_received = (currentReceived + totalReceived).toString()
          }
        })
      }

      return Promise.resolve({
        shipment_id: id,
        status: "partially_received",
        expense_per_unit: "6",
        postings,
      })
    }

    const response = await axiosInstance.post<ReceiveShipmentResponse>(`/purchase/shipments/${id}/receive`, data)
    return response.data
  }

  async closeShipment(id: string): Promise<PurchaseShipment> {
    if (USE_MOCK_DATA) {
      const index = mockShipments.findIndex((s) => s.id === id)
      if (index === -1) throw new Error("Shipment not found")
      mockShipments[index].status = "closed"
      mockShipments[index].updated_at = new Date().toISOString()
      return Promise.resolve(mockShipments[index])
    }

    const response = await axiosInstance.post<PurchaseShipment>(`/purchase/shipments/${id}/close`)
    return response.data
  }

  async addShipmentExpenseAdjustment(
    expenseId: string,
    data: CreateShipmentExpenseAdjustmentRequest,
  ): Promise<ShipmentExpenseAdjustment> {
    if (USE_MOCK_DATA) {
      const adjustment: ShipmentExpenseAdjustment = {
        id: crypto.randomUUID(),
        shipment_expense_id: expenseId,
        amount: data.amount,
        reason: data.reason || null,
        created_by: "mock-user-id",
        created_at: new Date().toISOString(),
      }
      return Promise.resolve(adjustment)
    }

    const response = await axiosInstance.post<ShipmentExpenseAdjustment>(
      `/purchase/shipments/expenses/${expenseId}/adjustments`,
      data,
    )
    return response.data
  }

  async getShipmentExpenseAdjustments(expenseId: string): Promise<ShipmentExpenseAdjustment[]> {
    if (USE_MOCK_DATA) {
      return Promise.resolve([])
    }

    const response = await axiosInstance.get<ShipmentExpenseAdjustment[]>(
      `/purchase/shipments/expenses/${expenseId}/adjustments`,
    )
    return response.data
  }
}

class BatchService {
  async getBatches(params?: { product_id?: string }): Promise<Batch[]> {
    if (USE_MOCK_DATA) {
      let filtered = [...mockBatches]
      if (params?.product_id) {
        filtered = filtered.filter((b) => b.product_id === params.product_id)
      }
      return Promise.resolve(filtered)
    }

    const response = await axiosInstance.get<Batch[]>("/purchase/batches", { params })
    return response.data
  }

  async getBatch(id: string): Promise<Batch> {
    if (USE_MOCK_DATA) {
      const batch = mockBatches.find((b) => b.id === id)
      if (!batch) throw new Error("Batch not found")
      return Promise.resolve(batch)
    }

    const response = await axiosInstance.get<Batch>(`/purchase/batches/${id}`)
    return response.data
  }

  async getBatchesByProduct(productId: string): Promise<Batch[]> {
    if (USE_MOCK_DATA) {
      const filtered = mockBatches.filter((b) => b.product_id === productId)
      return Promise.resolve(filtered)
    }

    const response = await axiosInstance.get<Batch[]>("/purchase/batches", {
      params: { product_id: productId },
    })
    return response.data
  }

  async addBatchExpense(id: string, data: AddBatchExpenseRequest): Promise<BatchExpense> {
    if (USE_MOCK_DATA) {
      const newExpense: BatchExpense = {
        id: crypto.randomUUID(),
        batch_id: id,
        expense_type_id: null,
        type: data.type,
        amount: data.amount,
        description: data.description ?? null,
        expense_date: new Date().toISOString().split("T")[0],
      }
      return Promise.resolve(newExpense)
    }

    const response = await axiosInstance.post<BatchExpense>(`/purchase/batches/${id}/expenses`, data)
    return response.data
  }

  async addBatchExpenseAdjustment(
    expenseId: string,
    data: CreateBatchExpenseAdjustmentRequest,
  ): Promise<BatchExpenseAdjustment> {
    if (USE_MOCK_DATA) {
      const adjustment: BatchExpenseAdjustment = {
        id: crypto.randomUUID(),
        batch_expense_id: expenseId,
        amount: data.amount,
        reason: data.reason || null,
        created_by: "mock-user-id",
        created_at: new Date().toISOString(),
      }
      return Promise.resolve(adjustment)
    }

    const response = await axiosInstance.post<BatchExpenseAdjustment>(
      `/purchase/batches/expenses/${expenseId}/adjustments`,
      data,
    )
    return response.data
  }

  async getBatchExpenseAdjustments(expenseId: string): Promise<BatchExpenseAdjustment[]> {
    if (USE_MOCK_DATA) {
      return Promise.resolve([])
    }

    const response = await axiosInstance.get<BatchExpenseAdjustment[]>(
      `/purchase/batches/expenses/${expenseId}/adjustments`,
    )
    return response.data
  }
}

export const expenseTypeService = new ExpenseTypeService()
export const purchaseOrderService = new PurchaseOrderService()
export const shipmentService = new ShipmentService()
export const batchService = new BatchService()
