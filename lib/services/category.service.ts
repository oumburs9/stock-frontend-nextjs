import type { Category, CreateCategoryRequest, UpdateCategoryRequest, PaginatedResponse } from "@/lib/types/master-data"
import { axiosInstance } from "../api/axios-instance";

// ============================================================================
// MOCK DATA - Showing entity relationships
// ============================================================================
let MOCK_CATEGORIES: Category[] = [
  // Root categories
  {
    id: "1",
    name: "Electronics",
    parent_id: null,
    attribute_set_id: null, // Parent category has no attribute set
  },
  {
    id: "4",
    name: "Furniture",
    parent_id: null,
    attribute_set_id: "4", // Furniture Attributes
  },
  {
    id: "6",
    name: "Clothing",
    parent_id: null,
    attribute_set_id: "3", // Clothing Attributes
  },

  // Sub-categories of Electronics
  {
    id: "2",
    name: "Laptops",
    parent_id: "1",
    attribute_set_id: "1", // Laptop Attributes
  },
  {
    id: "3",
    name: "Smartphones",
    parent_id: "1",
    attribute_set_id: "2", // Smartphone Attributes
  },
  {
    id: "5",
    name: "Tablets",
    parent_id: "1",
    attribute_set_id: "2", // Smartphone Attributes (similar to phones)
  },

  // Sub-categories of Furniture
  {
    id: "7",
    name: "Office Furniture",
    parent_id: "4",
    attribute_set_id: "4",
  },
  {
    id: "8",
    name: "Home Furniture",
    parent_id: "4",
    attribute_set_id: "4",
  },

  // Sub-categories of Clothing
  {
    id: "9",
    name: "Men's Clothing",
    parent_id: "6",
    attribute_set_id: "3",
  },
  {
    id: "10",
    name: "Women's Clothing",
    parent_id: "6",
    attribute_set_id: "3",
  },
]

class CategoryService {
  // ============================================================================
  // PRODUCTION API METHODS (commented out - uncomment to use real API)
  // ============================================================================

  
  async getCategories(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Category>> {
    const response = await axiosInstance.get<PaginatedResponse<Category>>('/master-data/categories', { params })
    return response.data
  }

  async getCategoryTree(): Promise<Category[]> {
    const response = await axiosInstance.get<Category[]>('/master-data/categories/tree')
    return response.data
  }

  async getCategory(id: string): Promise<Category | null> {
    try {
      const response = await axiosInstance.get<Category>(`/master-data/categories/${id}`)
      return response.data
    } catch {
      return null
    }
  }

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const response = await axiosInstance.post<Category>('/master-data/categories', data)
    return response.data
  }

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<void> {
    await axiosInstance.put(`/master-data/categories/${id}`, data)
  }

  async deleteCategory(id: string): Promise<void> {
    await axiosInstance.delete(`/master-data/categories/${id}`)
  }
 

  // ============================================================================
  // MOCK METHODS (currently active - comment out when using real API)
  // ============================================================================
/*
  async getCategories(params?: { page?: number; limit?: number; search?: string }): Promise<
    PaginatedResponse<Category>
  > {
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filtered = [...MOCK_CATEGORIES]

    if (params?.search) {
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(params.search!.toLowerCase()))
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

  async getCategoryTree(): Promise<Category[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const buildTree = (parentId: string | null): Category[] => {
      return MOCK_CATEGORIES.filter((c) => c.parent_id === parentId).map((c) => ({
        ...c,
        children: buildTree(c.id),
      }))
    }

    return buildTree(null)
  }

  async getCategory(id: string): Promise<Category | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return MOCK_CATEGORIES.find((c) => c.id === id) || null
  }

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newCategory: Category = {
      id: String(Date.now()),
      name: data.name,
      parent_id: data.parent_id || null,
      attribute_set_id: data.attribute_set_id || null,
    }
    MOCK_CATEGORIES.push(newCategory)
    return newCategory
  }

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = MOCK_CATEGORIES.findIndex((c) => c.id === id)
    if (index !== -1) {
      MOCK_CATEGORIES[index] = { ...MOCK_CATEGORIES[index], ...data }
    }
  }

  async deleteCategory(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    MOCK_CATEGORIES = MOCK_CATEGORIES.filter((c) => c.id !== id)
  }
    */
}

export const categoryService = new CategoryService()
