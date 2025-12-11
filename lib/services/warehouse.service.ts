import type { Warehouse, CreateWarehouseRequest, UpdateWarehouseRequest } from "@/lib/types/inventory"
import { axiosInstance } from "../api/axios-instance";

// ============================================================================
// MOCK DATA - Warehouses with realistic Ethiopian locations
// ============================================================================
let MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: "3b0af3c9-d927-4b41-8a17-f83b152b1f1e",
    name: "Addis Central Warehouse",
    address: "Bole, Addis Ababa",
    description: "Main distribution hub for central operations",
    created_at: "2025-01-15T10:30:00Z",
    updated_at: "2025-01-15T10:30:00Z",
  },
  {
    id: "72b9c6ab-f11e-49b6-9e2a-79b5a74d84a4",
    name: "Adama Warehouse",
    address: "Adama Industrial Zone",
    description: "Secondary warehouse for eastern distribution",
    created_at: "2025-02-10T14:22:00Z",
    updated_at: "2025-02-10T14:22:00Z",
  },
  {
    id: "a8f6e2c3-5d1b-4c9f-8e3a-2b7c9d1f5e4a",
    name: "Dire Dawa Warehouse",
    address: "Dire Dawa Trade Zone",
    description: "Regional warehouse for eastern Ethiopia",
    created_at: "2025-03-05T09:15:00Z",
    updated_at: "2025-03-05T09:15:00Z",
  },
  {
    id: "c9e7f3d4-6e2c-4d0a-9f4b-3c8d0e2g6f5b",
    name: "Hawassa Warehouse",
    address: "Hawassa Industrial Estate",
    description: "Southern region distribution center",
    created_at: "2025-03-20T11:45:00Z",
    updated_at: "2025-03-20T11:45:00Z",
  },
]

class WarehouseService {
  // ============================================================================
  // PRODUCTION API METHODS (commented out - uncomment to use real API)
  // ============================================================================

  
  async getWarehouses(params?: { page?: number; limit?: number; search?: string }): Promise<Warehouse[]> {
    const response = await axiosInstance.get<Warehouse[]>('/warehouses', { params })
    return response.data
  }

  async getWarehouse(id: string): Promise<Warehouse | null> {
    try {
      const response = await axiosInstance.get<Warehouse>(`/warehouses/${id}`)
      return response.data
    } catch {
      return null
    }
  }

  async createWarehouse(data: CreateWarehouseRequest): Promise<Warehouse> {
    const response = await axiosInstance.post<Warehouse>('/warehouses', data)
    return response.data
  }

  async updateWarehouse(id: string, data: UpdateWarehouseRequest): Promise<void> {
    await axiosInstance.patch(`/warehouses/${id}`, data)
  }

  async deleteWarehouse(id: string): Promise<void> {
    await axiosInstance.delete(`/warehouses/${id}`)
  }


  // ============================================================================
  // MOCK METHODS (currently active - comment out when using real API)
  // ============================================================================
/*
  async getWarehouses(params?: { page?: number; limit?: number; search?: string }): Promise<Warehouse[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filtered = [...MOCK_WAREHOUSES]

    if (params?.search) {
      filtered = filtered.filter(
        (w) =>
          w.name.toLowerCase().includes(params.search!.toLowerCase()) ||
          w.address.toLowerCase().includes(params.search!.toLowerCase()),
      )
    }

    return filtered
  }

  async getWarehouse(id: string): Promise<Warehouse | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return MOCK_WAREHOUSES.find((w) => w.id === id) || null
  }

  async createWarehouse(data: CreateWarehouseRequest): Promise<Warehouse> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newWarehouse: Warehouse = {
      id: `warehouse-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    MOCK_WAREHOUSES.push(newWarehouse)
    return newWarehouse
  }

  async updateWarehouse(id: string, data: UpdateWarehouseRequest): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = MOCK_WAREHOUSES.findIndex((w) => w.id === id)
    if (index !== -1) {
      MOCK_WAREHOUSES[index] = {
        ...MOCK_WAREHOUSES[index],
        ...data,
        updated_at: new Date().toISOString(),
      }
    }
  }

  async deleteWarehouse(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    MOCK_WAREHOUSES = MOCK_WAREHOUSES.filter((w) => w.id !== id)
  }*/
}

export const warehouseService = new WarehouseService()
