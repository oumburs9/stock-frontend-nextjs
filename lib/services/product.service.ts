import type { Product, CreateProductRequest, UpdateProductRequest, PaginatedResponse } from "@/lib/types/master-data"
import { categoryService } from "./category.service"
import { brandService } from "./brand.service"
import { unitService } from "./unit.service"
import { attributeService } from "./attribute.service"
import { axiosInstance } from "../api/axios-instance"

// ============================================================================
// MOCK DATA - Comprehensive products showing entity relationships
// ============================================================================
let MOCK_PRODUCTS: Product[] = [
  // Laptops
  {
    id: "1",
    name: 'MacBook Pro 16"',
    sku: "MBP-16-001",
    description: "High-performance laptop for professionals with M3 Pro chip",
    category_id: "2", // Laptops
    brand_id: "1", // Apple
    unit_id: "1", // Piece
    base_price: 2499.99,
  },
  {
    id: "3",
    name: "Dell XPS 15",
    sku: "DXPS-15-001",
    description: "Premium Windows laptop with Intel Core i7",
    category_id: "2", // Laptops
    brand_id: "3", // Dell
    unit_id: "1", // Piece
    base_price: 1799.99,
  },
  {
    id: "4",
    name: "HP Spectre x360",
    sku: "HP-SPEC-001",
    description: "Convertible laptop with touchscreen",
    category_id: "2", // Laptops
    brand_id: "4", // HP
    unit_id: "1", // Piece
    base_price: 1599.99,
  },

  // Smartphones
  {
    id: "2",
    name: "iPhone 15 Pro",
    sku: "IPH-15P-001",
    description: "Latest flagship smartphone with A17 Pro chip",
    category_id: "3", // Smartphones
    brand_id: "1", // Apple
    unit_id: "1", // Piece
    base_price: 999.99,
  },
  {
    id: "5",
    name: "Samsung Galaxy S24 Ultra",
    sku: "SGS-S24U-001",
    description: "Premium Android smartphone with S Pen",
    category_id: "3", // Smartphones
    brand_id: "2", // Samsung
    unit_id: "1", // Piece
    base_price: 1199.99,
  },

  // Tablets
  {
    id: "6",
    name: "iPad Pro 12.9",
    sku: "IPAD-PRO-001",
    description: "Professional tablet with M2 chip",
    category_id: "5", // Tablets
    brand_id: "1", // Apple
    unit_id: "1", // Piece
    base_price: 1099.99,
  },
]

class ProductService {
  // ============================================================================
  // PRODUCTION API METHODS (commented out - uncomment to use real API)
  // ============================================================================

  
  async getProducts(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Product>> {
    const response = await axiosInstance.get<PaginatedResponse<Product>>('/master-data/products', { params })
    return response.data
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const response = await axiosInstance.get<Product>(`/master-data/products/${id}`)
      return response.data
    } catch {
      return null
    }
  }

  async getProductFull(id: string): Promise<Product | null> {
    try {
      const response = await axiosInstance.get<Product>(`/master-data/products/${id}/full`)
      return response.data
    } catch {
      return null
    }
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    const response = await axiosInstance.post<Product>('/master-data/products', data)
    return response.data
  }

  async updateProduct(id: string, data: UpdateProductRequest): Promise<void> {
    await axiosInstance.put(`/master-data/products/${id}`, data)
  }

  async deleteProduct(id: string): Promise<void> {
    await axiosInstance.delete(`/master-data/products/${id}`)
  }
  

  // ============================================================================
  // MOCK METHODS (currently active - comment out when using real API)
  // ============================================================================
/*
  async getProducts(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<Product>> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filtered = [...MOCK_PRODUCTS]

    if (params?.search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(params.search!.toLowerCase()) ||
          p.sku.toLowerCase().includes(params.search!.toLowerCase()),
      )
    }

    const productsWithNames = await Promise.all(
      filtered.map(async (product) => {
        const category = product.category_id ? await categoryService.getCategory(product.category_id) : null
        const brand = product.brand_id ? await brandService.getBrand(product.brand_id) : null
        const unit = product.unit_id ? await unitService.getUnit(product.unit_id) : null

        return {
          ...product,
          categoryName: category?.name || null,
          brandName: brand?.name || null,
          unitName: unit?.name || null,
        }
      }),
    )

    const page = params?.page || 1
    const limit = params?.limit || 10
    const start = (page - 1) * limit
    const end = start + limit

    return {
      items: productsWithNames.slice(start, end),
      total: productsWithNames.length,
      page,
      limit,
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return MOCK_PRODUCTS.find((p) => p.id === id) || null
  }

  async getProductFull(id: string): Promise<Product | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const product = MOCK_PRODUCTS.find((p) => p.id === id)
    if (!product) return null

    const category = await categoryService.getCategory(product.category_id)
    const brand = product.brand_id ? await brandService.getBrand(product.brand_id) : null
    const unit = product.unit_id ? await unitService.getUnit(product.unit_id) : null
    const attributeValues = await attributeService.getProductAttributeValues(product.id)

    return {
      ...product,
      category,
      brand,
      unit,
      attributes: attributeValues,
    }
  }

  async createProduct(data: CreateProductRequest): Promise<Product> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newProduct: Product = {
      id: String(Date.now()),
      ...data,
    }
    MOCK_PRODUCTS.push(newProduct)
    return newProduct
  }

  async updateProduct(id: string, data: UpdateProductRequest): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = MOCK_PRODUCTS.findIndex((p) => p.id === id)
    if (index !== -1) {
      MOCK_PRODUCTS[index] = { ...MOCK_PRODUCTS[index], ...data }
    }
  }

  async deleteProduct(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    MOCK_PRODUCTS = MOCK_PRODUCTS.filter((p) => p.id !== id)
  }*/
}

export const productService = new ProductService()
