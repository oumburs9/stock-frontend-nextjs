import type { Brand, CreateBrandRequest, UpdateBrandRequest, PaginatedResponse } from "@/lib/types/master-data"
import { axiosInstance } from "../api/axios-instance";

// ============================================================================
// MOCK DATA
// ============================================================================
let MOCK_BRANDS: Brand[] = [
  { id: "1", name: "Apple" },
  { id: "2", name: "Samsung" },
  { id: "3", name: "Dell" },
  { id: "4", name: "HP" },
  { id: "5", name: "Lenovo" },
  { id: "6", name: "ASUS" },
  { id: "7", name: "Microsoft" },
  { id: "8", name: "Google" },
]

class BrandService {
  // ============================================================================
  // PRODUCTION API METHODS (commented out - uncomment to use real API)
  // ============================================================================


  async getBrands(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Brand>> {
    const response = await axiosInstance.get<PaginatedResponse<Brand>>('/master-data/brands', { params })
    return response.data
  }

  async getBrand(id: string): Promise<Brand | null> {
    try {
      const response = await axiosInstance.get<Brand>(`/master-data/brands/${id}`)
      return response.data
    } catch {
      return null
    }
  }

  async createBrand(data: CreateBrandRequest): Promise<Brand> {
    const response = await axiosInstance.post<Brand>('/master-data/brands', data)
    return response.data
  }

  async updateBrand(id: string, data: UpdateBrandRequest): Promise<void> {
    await axiosInstance.put(`/master-data/brands/${id}`, data)
  }

  async deleteBrand(id: string): Promise<void> {
    await axiosInstance.delete(`/master-data/brands/${id}`)
  }
  

  // ============================================================================
  // MOCK METHODS (currently active - comment out when using real API)
  // ============================================================================
/*
  async getBrands(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Brand>> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filtered = [...MOCK_BRANDS]

    if (params?.search) {
      filtered = filtered.filter((b) => b.name.toLowerCase().includes(params.search!.toLowerCase()))
    }

    const page = params?.page || 1
    const limit = params?.limit || 10
    const start = (page - 1) * limit
    const end = start + limit

    return {
      items: filtered.slice(start, end),
      total: filtered.length,
      page,
      limit,
    }
  }

  async getBrand(id: string): Promise<Brand | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return MOCK_BRANDS.find((b) => b.id === id) || null
  }

  async createBrand(data: CreateBrandRequest): Promise<Brand> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newBrand: Brand = {
      id: String(Date.now()),
      name: data.name,
    }
    MOCK_BRANDS.push(newBrand)
    return newBrand
  }

  async updateBrand(id: string, data: UpdateBrandRequest): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = MOCK_BRANDS.findIndex((b) => b.id === id)
    if (index !== -1) {
      MOCK_BRANDS[index] = { ...MOCK_BRANDS[index], ...data }
    }
  }

  async deleteBrand(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    MOCK_BRANDS = MOCK_BRANDS.filter((b) => b.id !== id)
} */
}

export const brandService = new BrandService()
