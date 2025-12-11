import type { Shop, CreateShopRequest, UpdateShopRequest } from "@/lib/types/inventory"
import { axiosInstance } from "../api/axios-instance";

// ============================================================================
// MOCK DATA - Retail shops with realistic locations
// ============================================================================
let MOCK_SHOPS: Shop[] = [
  {
    id: "fc845e2f-556e-4a94-b67f-3e3b7ec8c234",
    name: "Piassa Retail Shop",
    address: "Piassa, Addis Ababa",
    description: "High-traffic retail branch with premium customer service",
    created_at: "2025-01-20T08:00:00Z",
    updated_at: "2025-01-20T08:00:00Z",
  },
  {
    id: "0de72e4d-73f7-4e0c-b14d-167bbae6c53a",
    name: "Bole Shop",
    address: "Bole Medhanealem, Addis Ababa",
    description: "Premium retail branch in upscale district",
    created_at: "2025-01-25T10:15:00Z",
    updated_at: "2025-01-25T10:15:00Z",
  },
  {
    id: "1e8a3f5c-9b7d-4e2f-a6c1-2d9f8e3b4c5a",
    name: "Lebu Shop",
    address: "Lebu, Addis Ababa",
    description: "Community retail shop serving local customers",
    created_at: "2025-02-01T12:30:00Z",
    updated_at: "2025-02-01T12:30:00Z",
  },
  {
    id: "2f9b4e6d-0c8e-5f3a-b7d2-3e0a9f4c5d6e",
    name: "Mexico Square Shop",
    address: "Mexico Square, Addis Ababa",
    description: "Downtown retail location with high foot traffic",
    created_at: "2025-02-10T14:45:00Z",
    updated_at: "2025-02-10T14:45:00Z",
  },
]

class ShopService {
  // ============================================================================
  // PRODUCTION API METHODS (commented out - uncomment to use real API)
  // ============================================================================


  async getShops(params?: { page?: number; limit?: number; search?: string }): Promise<Shop[]> {
    const response = await axiosInstance.get<Shop[]>('/shops', { params })
    return response.data
  }

  async getShop(id: string): Promise<Shop | null> {
    try {
      const response = await axiosInstance.get<Shop>(`/shops/${id}`)
      return response.data
    } catch {
      return null
    }
  }

  async createShop(data: CreateShopRequest): Promise<Shop> {
    const response = await axiosInstance.post<Shop>('/shops', data)
    return response.data
  }

  async updateShop(id: string, data: UpdateShopRequest): Promise<void> {
    await axiosInstance.patch(`/shops/${id}`, data)
  }

  async deleteShop(id: string): Promise<void> {
    await axiosInstance.delete(`/shops/${id}`)
  }
 

  // ============================================================================
  // MOCK METHODS (currently active - comment out when using real API)
  // ============================================================================
/*
  async getShops(params?: { page?: number; limit?: number; search?: string }): Promise<Shop[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filtered = [...MOCK_SHOPS]

    if (params?.search) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(params.search!.toLowerCase()) ||
          s.address.toLowerCase().includes(params.search!.toLowerCase()),
      )
    }

    return filtered
  }

  async getShop(id: string): Promise<Shop | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return MOCK_SHOPS.find((s) => s.id === id) || null
  }

  async createShop(data: CreateShopRequest): Promise<Shop> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newShop: Shop = {
      id: `shop-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    MOCK_SHOPS.push(newShop)
    return newShop
  }

  async updateShop(id: string, data: UpdateShopRequest): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = MOCK_SHOPS.findIndex((s) => s.id === id)
    if (index !== -1) {
      MOCK_SHOPS[index] = {
        ...MOCK_SHOPS[index],
        ...data,
        updated_at: new Date().toISOString(),
      }
    }
  }

  async deleteShop(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    MOCK_SHOPS = MOCK_SHOPS.filter((s) => s.id !== id)
  } */
}

export const shopService = new ShopService()
