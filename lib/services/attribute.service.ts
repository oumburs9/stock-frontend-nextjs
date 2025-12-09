import type {
  Attribute,
  CreateAttributeRequest,
  UpdateAttributeRequest,
  AttributeSet,
  CreateAttributeSetRequest,
  UpdateAttributeSetRequest,
  SetItem,
  CreateSetItemRequest,
  ProductAttributeValue,
  CreateProductAttributeValueRequest,
} from "@/lib/types/master-data"
import { axiosInstance } from "../api/axios-instance"

// ============================================================================
// MOCK DATA - Comprehensive data showing entity relationships
// ============================================================================
let MOCK_ATTRIBUTES: Attribute[] = [
  // Electronics attributes
  { id: "1", name: "screen_size", label: "Screen Size", data_type: "number", is_required: false },
  { id: "2", name: "ram", label: "RAM (GB)", data_type: "number", is_required: true },
  { id: "3", name: "storage", label: "Storage (GB)", data_type: "number", is_required: true },
  { id: "4", name: "color", label: "Color", data_type: "text", is_required: false },
  { id: "5", name: "warranty_expiry", label: "Warranty Expiry Date", data_type: "date", is_required: false },
  { id: "6", name: "is_waterproof", label: "Waterproof", data_type: "boolean", is_required: false },
  { id: "7", name: "processor", label: "Processor", data_type: "text", is_required: true },
  { id: "8", name: "battery_life", label: "Battery Life (hours)", data_type: "number", is_required: false },
  { id: "9", name: "weight", label: "Weight (kg)", data_type: "number", is_required: false },
  { id: "10", name: "has_touchscreen", label: "Touchscreen", data_type: "boolean", is_required: false },
  // Clothing attributes
  { id: "11", name: "size", label: "Size", data_type: "text", is_required: true },
  { id: "12", name: "material", label: "Material", data_type: "text", is_required: true },
  { id: "13", name: "is_machine_washable", label: "Machine Washable", data_type: "boolean", is_required: false },
  // Furniture attributes
  { id: "14", name: "dimensions", label: "Dimensions (LxWxH cm)", data_type: "text", is_required: true },
  { id: "15", name: "wood_type", label: "Wood Type", data_type: "text", is_required: false },
  { id: "16", name: "assembly_required", label: "Assembly Required", data_type: "boolean", is_required: false },
]

let MOCK_ATTRIBUTE_SETS: AttributeSet[] = [
  { id: "1", name: "Laptop Attributes", items: [] },
  { id: "2", name: "Smartphone Attributes", items: [] },
  { id: "3", name: "Clothing Attributes", items: [] },
  { id: "4", name: "Furniture Attributes", items: [] },
]

let MOCK_SET_ITEMS: SetItem[] = [
  // Laptop Set (id: 1)
  { id: "1", set_id: "1", attribute_id: "1", sort_order: 1 },
  { id: "2", set_id: "1", attribute_id: "2", sort_order: 2 },
  { id: "3", set_id: "1", attribute_id: "3", sort_order: 3 },
  { id: "4", set_id: "1", attribute_id: "4", sort_order: 4 },
  { id: "5", set_id: "1", attribute_id: "7", sort_order: 5 },
  { id: "6", set_id: "1", attribute_id: "8", sort_order: 6 },
  { id: "7", set_id: "1", attribute_id: "9", sort_order: 7 },
  { id: "8", set_id: "1", attribute_id: "10", sort_order: 8 },
  { id: "9", set_id: "1", attribute_id: "5", sort_order: 9 },

  // Smartphone Set (id: 2)
  { id: "10", set_id: "2", attribute_id: "1", sort_order: 1 },
  { id: "11", set_id: "2", attribute_id: "2", sort_order: 2 },
  { id: "12", set_id: "2", attribute_id: "3", sort_order: 3 },
  { id: "13", set_id: "2", attribute_id: "4", sort_order: 4 },
  { id: "14", set_id: "2", attribute_id: "6", sort_order: 5 },
  { id: "15", set_id: "2", attribute_id: "8", sort_order: 6 },
  { id: "16", set_id: "2", attribute_id: "9", sort_order: 7 },
  { id: "17", set_id: "2", attribute_id: "5", sort_order: 8 },

  // Clothing Set (id: 3)
  { id: "18", set_id: "3", attribute_id: "11", sort_order: 1 },
  { id: "19", set_id: "3", attribute_id: "12", sort_order: 2 },
  { id: "20", set_id: "3", attribute_id: "4", sort_order: 3 },
  { id: "21", set_id: "3", attribute_id: "13", sort_order: 4 },

  // Furniture Set (id: 4)
  { id: "22", set_id: "4", attribute_id: "14", sort_order: 1 },
  { id: "23", set_id: "4", attribute_id: "15", sort_order: 2 },
  { id: "24", set_id: "4", attribute_id: "4", sort_order: 3 },
  { id: "25", set_id: "4", attribute_id: "16", sort_order: 4 },
  { id: "26", set_id: "4", attribute_id: "9", sort_order: 5 },
]

let MOCK_PRODUCT_ATTRIBUTE_VALUES: ProductAttributeValue[] = [
  // MacBook Pro 16" (product id: 1, category: Laptops, set: Laptop Attributes)
  {
    id: "1",
    product_id: "1",
    attribute_id: "1",
    value_number: 16,
    value_text: null,
    value_date: null,
    value_bool: null,
  },
  {
    id: "2",
    product_id: "1",
    attribute_id: "2",
    value_number: 32,
    value_text: null,
    value_date: null,
    value_bool: null,
  },
  {
    id: "3",
    product_id: "1",
    attribute_id: "3",
    value_number: 1024,
    value_text: null,
    value_date: null,
    value_bool: null,
  },
  {
    id: "4",
    product_id: "1",
    attribute_id: "4",
    value_text: "Space Gray",
    value_number: null,
    value_date: null,
    value_bool: null,
  },
  {
    id: "5",
    product_id: "1",
    attribute_id: "7",
    value_text: "Apple M3 Pro",
    value_number: null,
    value_date: null,
    value_bool: null,
  },
  {
    id: "6",
    product_id: "1",
    attribute_id: "8",
    value_number: 18,
    value_text: null,
    value_date: null,
    value_bool: null,
  },
  {
    id: "7",
    product_id: "1",
    attribute_id: "9",
    value_number: 2.1,
    value_text: null,
    value_date: null,
    value_bool: null,
  },
  {
    id: "8",
    product_id: "1",
    attribute_id: "10",
    value_bool: false,
    value_text: null,
    value_number: null,
    value_date: null,
  },
  {
    id: "9",
    product_id: "1",
    attribute_id: "5",
    value_date: "2026-12-31",
    value_text: null,
    value_number: null,
    value_bool: null,
  },

  // iPhone 15 Pro (product id: 2, category: Smartphones, set: Smartphone Attributes)
  {
    id: "10",
    product_id: "2",
    attribute_id: "1",
    value_number: 6.1,
    value_text: null,
    value_date: null,
    value_bool: null,
  },
  {
    id: "11",
    product_id: "2",
    attribute_id: "2",
    value_number: 8,
    value_text: null,
    value_date: null,
    value_bool: null,
  },
  {
    id: "12",
    product_id: "2",
    attribute_id: "3",
    value_number: 256,
    value_text: null,
    value_date: null,
    value_bool: null,
  },
  {
    id: "13",
    product_id: "2",
    attribute_id: "4",
    value_text: "Titanium Blue",
    value_number: null,
    value_date: null,
    value_bool: null,
  },
  {
    id: "14",
    product_id: "2",
    attribute_id: "6",
    value_bool: true,
    value_text: null,
    value_number: null,
    value_date: null,
  },
  {
    id: "15",
    product_id: "2",
    attribute_id: "8",
    value_number: 23,
    value_text: null,
    value_date: null,
    value_bool: null,
  },
  {
    id: "16",
    product_id: "2",
    attribute_id: "9",
    value_number: 0.221,
    value_text: null,
    value_date: null,
    value_bool: null,
  },
  {
    id: "17",
    product_id: "2",
    attribute_id: "5",
    value_date: "2025-09-15",
    value_text: null,
    value_number: null,
    value_bool: null,
  },

  // Dell XPS 15 (product id: 3, category: Laptops, set: Laptop Attributes)
  {
    id: "18",
    product_id: "3",
    attribute_id: "1",
    value_number: 15.6,
    value_text: null,
    value_date: null,
    value_bool: null,
  },
  {
    id: "19",
    product_id: "3",
    attribute_id: "2",
    value_number: 16,
    value_text: null,
    value_date: null,
    value_bool: null,
  },
  {
    id: "20",
    product_id: "3",
    attribute_id: "3",
    value_number: 512,
    value_text: null,
    value_date: null,
    value_bool: null,
  },
  {
    id: "21",
    product_id: "3",
    attribute_id: "4",
    value_text: "Platinum Silver",
    value_number: null,
    value_date: null,
    value_bool: null,
  },
  {
    id: "22",
    product_id: "3",
    attribute_id: "7",
    value_text: "Intel Core i7-13700H",
    value_number: null,
    value_date: null,
    value_bool: null,
  },
  {
    id: "23",
    product_id: "3",
    attribute_id: "8",
    value_number: 12,
    value_text: null,
    value_date: null,
    value_bool: null,
  },
  {
    id: "24",
    product_id: "3",
    attribute_id: "9",
    value_number: 1.86,
    value_text: null,
    value_date: null,
    value_bool: null,
  },
  {
    id: "25",
    product_id: "3",
    attribute_id: "10",
    value_bool: true,
    value_text: null,
    value_number: null,
    value_date: null,
  },
  {
    id: "26",
    product_id: "3",
    attribute_id: "5",
    value_date: "2026-06-30",
    value_text: null,
    value_number: null,
    value_bool: null,
  },
]

class AttributeService {
  // ============================================================================
  // PRODUCTION API METHODS (commented out - uncomment to use real API)
  // ============================================================================


  // Attributes
  async getAttributes(): Promise<Attribute[]> {
    const response = await axiosInstance.get<Attribute[]>('/master-data/attribute-engine/attributes')
    return response.data
  }

  async createAttribute(data: CreateAttributeRequest): Promise<Attribute> {
    const response = await axiosInstance.post<Attribute>('/master-data/attribute-engine/attributes', data)
    return response.data
  }

  async updateAttribute(id: string, data: UpdateAttributeRequest): Promise<void> {
    await axiosInstance.put(`/master-data/attribute-engine/attributes/${id}`, data)
  }

  async deleteAttribute(id: string): Promise<void> {
    await axiosInstance.delete(`/master-data/attribute-engine/attributes/${id}`)
  }

  // Attribute Sets
  async getAttributeSets(): Promise<AttributeSet[]> {
    const response = await axiosInstance.get<AttributeSet[]>('/master-data/attribute-engine/sets')
    return response.data
  }

  async getAttributeSet(id: string): Promise<AttributeSet | null> {
    try {
      const sets = await this.getAttributeSets()
      return sets.find(s => s.id === id) || null
    } catch {
      return null
    }
  }

  async createAttributeSet(data: CreateAttributeSetRequest): Promise<AttributeSet> {
    const response = await axiosInstance.post<AttributeSet>('/master-data/attribute-engine/sets', data)
    return response.data
  }

  async updateAttributeSet(id: string, data: UpdateAttributeSetRequest): Promise<void> {
    await axiosInstance.put(`/master-data/attribute-engine/sets/${id}`, data)
  }

  async deleteAttributeSet(id: string): Promise<void> {
    await axiosInstance.delete(`/master-data/attribute-engine/sets/${id}`)
  }

  // Set Items
  async addItemsToSet(setId: string, items: CreateSetItemRequest[]): Promise<SetItem[]> {
    const response = await axiosInstance.post<SetItem[]>(`/master-data/attribute-engine/sets/${setId}/items`, items)
    return response.data
  }

  async deleteSetItem(itemId: string): Promise<void> {
    await axiosInstance.delete(`/master-data/attribute-engine/set-items/${itemId}`)
  }

  // Product Attribute Values
  async getProductAttributeValues(productId: string): Promise<ProductAttributeValue[]> {
    const response = await axiosInstance.get<ProductAttributeValue[]>(`/master-data/attribute-engine/products/${productId}/values`)
    return response.data
  }

  async setProductAttributeValues(product_id: string, values: CreateProductAttributeValueRequest[]): Promise<ProductAttributeValue[]> {
    const response = await axiosInstance.post<ProductAttributeValue[]>(`/master-data/attribute-engine/products/${product_id}/values`, values)
    return response.data
  }


  // ============================================================================
  // MOCK METHODS (currently active - comment out when using real API)
  // ============================================================================
/*
  async getAttributes(): Promise<Attribute[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return MOCK_ATTRIBUTES
  }

  async createAttribute(data: CreateAttributeRequest): Promise<Attribute> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newAttribute: Attribute = {
      id: String(Date.now()),
      ...data,
    }
    MOCK_ATTRIBUTES.push(newAttribute)
    return newAttribute
  }

  async updateAttribute(id: string, data: UpdateAttributeRequest): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = MOCK_ATTRIBUTES.findIndex((a) => a.id === id)
    if (index !== -1) {
      MOCK_ATTRIBUTES[index] = { ...MOCK_ATTRIBUTES[index], ...data }
    }
  }

  async deleteAttribute(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    MOCK_ATTRIBUTES = MOCK_ATTRIBUTES.filter((a) => a.id !== id)
  }

  async getAttributeSets(): Promise<AttributeSet[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return MOCK_ATTRIBUTE_SETS.map((set) => ({
      ...set,
      items: MOCK_SET_ITEMS.filter((item) => item.set_id === set.id).map((item) => ({
        ...item,
        attribute: MOCK_ATTRIBUTES.find((a) => a.id === item.attribute_id),
      })),
    }))
  }

  async getAttributeSet(id: string): Promise<AttributeSet | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const set = MOCK_ATTRIBUTE_SETS.find((s) => s.id === id)
    if (!set) return null

    return {
      ...set,
      items: MOCK_SET_ITEMS.filter((item) => item.set_id === set.id).map((item) => ({
        ...item,
        attribute: MOCK_ATTRIBUTES.find((a) => a.id === item.attribute_id),
      })),
    }
  }

  async createAttributeSet(data: CreateAttributeSetRequest): Promise<AttributeSet> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newSet: AttributeSet = {
      id: String(Date.now()),
      name: data.name,
      items: [],
    }
    MOCK_ATTRIBUTE_SETS.push(newSet)
    return newSet
  }

  async updateAttributeSet(id: string, data: UpdateAttributeSetRequest): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = MOCK_ATTRIBUTE_SETS.findIndex((s) => s.id === id)
    if (index !== -1) {
      MOCK_ATTRIBUTE_SETS[index] = { ...MOCK_ATTRIBUTE_SETS[index], ...data }
    }
  }

  async deleteAttributeSet(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    MOCK_ATTRIBUTE_SETS = MOCK_ATTRIBUTE_SETS.filter((s) => s.id !== id)
    MOCK_SET_ITEMS = MOCK_SET_ITEMS.filter((item) => item.set_id !== id)
  }

  async addItemsToSet(setId: string, items: CreateSetItemRequest[]): Promise<SetItem[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newItems = items.map((item) => ({
      id: String(Date.now() + Math.random()),
      set_id: setId,
      ...item,
    }))
    MOCK_SET_ITEMS.push(...newItems)
    return newItems
  }

  async deleteSetItem(itemId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    MOCK_SET_ITEMS = MOCK_SET_ITEMS.filter((item) => item.id !== itemId)
  }

  async getProductAttributeValues(productId: string): Promise<ProductAttributeValue[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return MOCK_PRODUCT_ATTRIBUTE_VALUES.filter((v) => v.product_id === productId).map((v) => ({
      ...v,
      attribute: MOCK_ATTRIBUTES.find((a) => a.id === v.attribute_id),
    }))
  }

  async setProductAttributeValues(
    productId: string,
    values: CreateProductAttributeValueRequest[],
  ): Promise<ProductAttributeValue[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    MOCK_PRODUCT_ATTRIBUTE_VALUES = MOCK_PRODUCT_ATTRIBUTE_VALUES.filter((v) => v.product_id !== productId)

    const newValues = values.map((v) => ({
      id: String(Date.now() + Math.random()),
      product_id: productId,
      ...v,
    }))
    MOCK_PRODUCT_ATTRIBUTE_VALUES.push(...newValues)

    return newValues.map((v) => ({
      ...v,
      attribute: MOCK_ATTRIBUTES.find((a) => a.id === v.attribute_id),
    }))
  }*/
}

export const attributeService = new AttributeService()
