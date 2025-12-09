import type { Partner, CreatePartnerRequest, UpdatePartnerRequest, PaginatedResponse } from "@/lib/types/master-data"
import { axiosInstance } from "../api/axios-instance";

// ============================================================================
// MOCK DATA
// ============================================================================
let MOCK_PARTNERS: Partner[] = [
  {
    id: "1",
    name: "ABC Electronics Corp",
    is_customer: true,
    is_supplier: false,
    phone: "+1-555-0101",
    email: "contact@abcelectronics.com",
    address: "123 Business St, New York, NY 10001",
    tax_number: "TAX-ABC-123456",
    credit_limit: 50000,
  },
  {
    id: "2",
    name: "XYZ Component Supplies",
    is_customer: false,
    is_supplier: true,
    phone: "+1-555-0202",
    email: "sales@xyzsupplies.com",
    address: "456 Vendor Ave, San Francisco, CA 94102",
    tax_number: "TAX-XYZ-789012",
    credit_limit: null,
  },
  {
    id: "3",
    name: "Global Trading Co",
    is_customer: true,
    is_supplier: true,
    phone: "+1-555-0303",
    email: "info@globaltrading.com",
    address: "789 Commerce Blvd, Chicago, IL 60601",
    tax_number: "TAX-GLB-345678",
    credit_limit: 100000,
  },
  {
    id: "4",
    name: "Tech Distributors Inc",
    is_customer: true,
    is_supplier: false,
    phone: "+1-555-0404",
    email: "orders@techdist.com",
    address: "321 Tech Park, Austin, TX 78701",
    tax_number: "TAX-TDI-901234",
    credit_limit: 75000,
  },
  {
    id: "5",
    name: "Premium Parts Wholesale",
    is_customer: false,
    is_supplier: true,
    phone: "+1-555-0505",
    email: "wholesale@premiumparts.com",
    address: "654 Industrial Way, Seattle, WA 98101",
    tax_number: "TAX-PPW-567890",
    credit_limit: null,
  },
]

class PartnerService {
  // ============================================================================
  // PRODUCTION API METHODS (commented out - uncomment to use real API)
  // ============================================================================


  async getPartners(params?: { 
    page?: number; 
    limit?: number; 
    search?: string;
    is_customer?: boolean;
    is_supplier?: boolean;
  }): Promise<PaginatedResponse<Partner>> {
    const response = await axiosInstance.get<PaginatedResponse<Partner>>('/master-data/partners', { params })
    return response.data
  }

  async getPartner(id: string): Promise<Partner | null> {
    try {
      const response = await axiosInstance.get<Partner>(`/master-data/partners/${id}`)
      return response.data
    } catch {
      return null
    }
  }

  async createPartner(data: CreatePartnerRequest): Promise<Partner> {
    const response = await axiosInstance.post<Partner>('/master-data/partners', data)
    return response.data
  }

  async updatePartner(id: string, data: UpdatePartnerRequest): Promise<void> {
    await axiosInstance.put(`/master-data/partners/${id}`, data)
  }

  async deletePartner(id: string): Promise<void> {
    await axiosInstance.delete(`/master-data/partners/${id}`)
  }
 

  // ============================================================================
  // MOCK METHODS (currently active - comment out when using real API)
  // ============================================================================

 /* async getPartners(params?: {
    page?: number
    limit?: number
    search?: string
    is_customer?: boolean
    is_supplier?: boolean
  }): Promise<PaginatedResponse<Partner>> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filtered = [...MOCK_PARTNERS]

    if (params?.search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(params.search!.toLowerCase()) ||
          p.email?.toLowerCase().includes(params.search!.toLowerCase()),
      )
    }

    if (params?.is_customer !== undefined) {
      filtered = filtered.filter((p) => p.is_customer === params.is_customer)
    }

    if (params?.is_supplier !== undefined) {
      filtered = filtered.filter((p) => p.is_supplier === params.is_supplier)
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

  async getPartner(id: string): Promise<Partner | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return MOCK_PARTNERS.find((p) => p.id === id) || null
  }

  async createPartner(data: CreatePartnerRequest): Promise<Partner> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newPartner: Partner = {
      id: String(Date.now()),
      ...data,
    }
    MOCK_PARTNERS.push(newPartner)
    return newPartner
  }

  async updatePartner(id: string, data: UpdatePartnerRequest): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = MOCK_PARTNERS.findIndex((p) => p.id === id)
    if (index !== -1) {
      MOCK_PARTNERS[index] = { ...MOCK_PARTNERS[index], ...data }
    }
  }

  async deletePartner(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    MOCK_PARTNERS = MOCK_PARTNERS.filter((p) => p.id !== id)
  }  */
}

export const partnerService = new PartnerService()
