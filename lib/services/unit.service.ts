import type { Unit, CreateUnitRequest, UpdateUnitRequest, PaginatedResponse } from "@/lib/types/master-data"
import { axiosInstance } from "../api/axios-instance";

// ============================================================================
// MOCK DATA
// ============================================================================
let MOCK_UNITS: Unit[] = [
  { id: "1", name: "Piece", abbreviation: "pcs" },
  { id: "2", name: "Kilogram", abbreviation: "kg" },
  { id: "3", name: "Liter", abbreviation: "L" },
  { id: "4", name: "Meter", abbreviation: "m" },
  { id: "5", name: "Box", abbreviation: "box" },
  { id: "6", name: "Dozen", abbreviation: "dz" },
  { id: "7", name: "Gram", abbreviation: "g" },
  { id: "8", name: "Milliliter", abbreviation: "mL" },
]

class UnitService {
  // ============================================================================
  // PRODUCTION API METHODS (commented out - uncomment to use real API)
  // ============================================================================

  
  async getUnits(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Unit>> {
    const response = await axiosInstance.get<PaginatedResponse<Unit>>('/master-data/units', { params })
    return response.data
  }

  async getUnit(id: string): Promise<Unit | null> {
    try {
      const response = await axiosInstance.get<Unit>(`/master-data/units/${id}`)
      return response.data
    } catch {
      return null
    }
  }

  async createUnit(data: CreateUnitRequest): Promise<Unit> {
    const response = await axiosInstance.post<Unit>('/master-data/units', data)
    return response.data
  }

  async updateUnit(id: string, data: UpdateUnitRequest): Promise<void> {
    await axiosInstance.put(`/master-data/units/${id}`, data)
  }

  async deleteUnit(id: string): Promise<void> {
    await axiosInstance.delete(`/master-data/units/${id}`)
  }
  

  // ============================================================================
  // MOCK METHODS (currently active - comment out when using real API)
  // ============================================================================
/*
  async getUnits(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Unit>> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filtered = [...MOCK_UNITS]

    if (params?.search) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(params.search!.toLowerCase()) ||
          u.abbreviation.toLowerCase().includes(params.search!.toLowerCase()),
      )
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

  async getUnit(id: string): Promise<Unit | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return MOCK_UNITS.find((u) => u.id === id) || null
  }

  async createUnit(data: CreateUnitRequest): Promise<Unit> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newUnit: Unit = {
      id: String(Date.now()),
      name: data.name,
      abbreviation: data.abbreviation,
    }
    MOCK_UNITS.push(newUnit)
    return newUnit
  }

  async updateUnit(id: string, data: UpdateUnitRequest): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = MOCK_UNITS.findIndex((u) => u.id === id)
    if (index !== -1) {
      MOCK_UNITS[index] = { ...MOCK_UNITS[index], ...data }
    }
  }

  async deleteUnit(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    MOCK_UNITS = MOCK_UNITS.filter((u) => u.id !== id)
  } */
}
  

export const unitService = new UnitService()
