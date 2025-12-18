import type { StockTransaction } from "@/lib/types/inventory"
import { axiosInstance } from "../api/axios-instance";
import { PaginatedResponse } from "../types/master-data";

// ============================================================================
// MOCK DATA - Full inventory transaction history
// ============================================================================
// const MOCK_TRANSACTIONS: StockTransaction[] = [
//   {
//     id: "txn-1",
//     product: { id: "1", name: 'MacBook Pro 16"' },
//     toWarehouse: {
//       id: "3b0af3c9-d927-4b41-8a17-f83b152b1f1e",
//       name: "Addis Central Warehouse",
//       address: "Bole, Addis Ababa",
//     },
//     quantity: "25",
//     direction: "in",
//     reason: "year_end_reconciliation",
//     relatedType: "adjustment",
//     createdAt: "2025-12-10T06:18:12.334Z",
//   },
//   {
//     id: "txn-2",
//     product: { id: "1", name: 'MacBook Pro 16"' },
//     fromWarehouse: {
//       id: "3b0af3c9-d927-4b41-8a17-f83b152b1f1e",
//       name: "Addis Central Warehouse",
//       address: "Bole, Addis Ababa",
//     },
//     toWarehouse: {
//       id: "72b9c6ab-f11e-49b6-9e2a-79b5a74d84a4",
//       name: "Adama Warehouse",
//       address: "Adama Industrial Zone",
//     },
//     quantity: "10",
//     direction: "transfer",
//     reason: "inter_warehouse_transfer",
//     createdAt: "2025-12-09T14:30:00.000Z",
//   },
//   {
//     id: "txn-3",
//     product: { id: "2", name: "iPhone 15 Pro" },
//     fromWarehouse: {
//       id: "3b0af3c9-d927-4b41-8a17-f83b152b1f1e",
//       name: "Addis Central Warehouse",
//       address: "Bole, Addis Ababa",
//     },
//     toWarehouse: null,
//     quantity: "5",
//     direction: "out",
//     reason: "sales_order",
//     relatedType: "sales_order",
//     relatedId: "SO-2025-001",
//     createdAt: "2025-12-08T10:15:30.000Z",
//   },
//   {
//     id: "txn-4",
//     product: { id: "1", name: 'MacBook Pro 16"' },
//     toWarehouse: {
//       id: "3b0af3c9-d927-4b41-8a17-f83b152b1f1e",
//       name: "Addis Central Warehouse",
//       address: "Bole, Addis Ababa",
//     },
//     quantity: "30",
//     direction: "in",
//     reason: "purchase_order",
//     relatedType: "purchase_order",
//     relatedId: "PO-2025-012",
//     createdAt: "2025-12-07T08:45:00.000Z",
//   },
// ]

class StockTransactionService {
  // ============================================================================
  // PRODUCTION API METHODS (commented out - uncomment to use real API)
  // ============================================================================

  
  async getTransactions(params?: { page?: number; limit?: number; productId?: string; warehouseId?: string; direction?: string; startDate?: string; endDate?: string }): Promise<PaginatedResponse<StockTransaction>> {
    const response = await axiosInstance.get<PaginatedResponse<StockTransaction>>('/stock-transactions', { params })
    return response.data
  }

  async getTransaction(id: string): Promise<StockTransaction | null> {
    try {
      const response = await axiosInstance.get<StockTransaction>(`/stock-transactions/${id}`)
      return response.data
    } catch {
      return null
    }
  }


  // ============================================================================
  // MOCK METHODS (currently active - comment out when using real API)
  // ============================================================================
/*
  async getTransactions(params?: {
    page?: number
    limit?: number
    productId?: string
    warehouseId?: string
    shopId?: string
    direction?: string
    startDate?: string
    endDate?: string
  }): Promise<StockTransaction[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filtered = [...MOCK_TRANSACTIONS]

    if (params?.productId) {
      filtered = filtered.filter((t) => t.product.id === params.productId)
    }
    if (params?.warehouseId) {
      filtered = filtered.filter(
        (t) => t.fromWarehouse?.id === params.warehouseId || t.toWarehouse?.id === params.warehouseId,
      )
    }
    if (params?.shopId) {
      filtered = filtered.filter((t) => t.fromShop?.id === params.shopId || t.toShop?.id === params.shopId)
    }
    if (params?.direction) {
      filtered = filtered.filter((t) => t.direction === params.direction)
    }
    if (params?.startDate) {
      filtered = filtered.filter((t) => new Date(t.createdAt) >= new Date(params.startDate!))
    }
    if (params?.endDate) {
      filtered = filtered.filter((t) => new Date(t.createdAt) <= new Date(params.endDate!))
    }

    return filtered
  }

  async getTransaction(id: string): Promise<StockTransaction | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return MOCK_TRANSACTIONS.find((t) => t.id === id) || null
  }*/
}

export const stockTransactionService = new StockTransactionService()
