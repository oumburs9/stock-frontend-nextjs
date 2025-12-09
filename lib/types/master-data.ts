// ============================================================================
// CATEGORY TYPES
// ============================================================================
export interface Category {
  id: string
  name: string
  parent_id?: string | null
  attribute_set_id?: string | null
  created_at?: string
  updated_at?: string
  children?: Category[]
}

export interface CreateCategoryRequest {
  name: string
  parent_id?: string | null
  attribute_set_id?: string | null
}

export interface UpdateCategoryRequest {
  name?: string
  parent_id?: string | null
  attribute_set_id?: string | null
}

export interface PaginatedResponse<T> {
  items?: T[]
  total?: number
  page?: number
  limit?: number
}

// ============================================================================
// UNIT TYPES
// ============================================================================
export interface Unit {
  id: string
  name: string
  abbreviation: string
  created_at?: string
  updated_at?: string
}

export interface CreateUnitRequest {
  name: string
  abbreviation: string
}

export interface UpdateUnitRequest {
  name?: string
  abbreviation?: string
}

// ============================================================================
// BRAND TYPES
// ============================================================================
export interface Brand {
  id: string
  name: string
  created_at?: string
  updated_at?: string
}

export interface CreateBrandRequest {
  name: string
}

export interface UpdateBrandRequest {
  name?: string
}

// ============================================================================
// PARTNER TYPES
// ============================================================================
export interface Partner {
  id: string
  name: string
  is_customer: boolean
  is_supplier: boolean
  phone?: string | null
  email?: string | null
  address?: string | null
  tax_number?: string | null
  credit_limit?: number | null
  created_at?: string
  updated_at?: string
}

export interface CreatePartnerRequest {
  name: string
  is_customer: boolean
  is_supplier: boolean
  phone?: string
  email?: string
  address?: string
  tax_number?: string
  credit_limit?: number
}

export interface UpdatePartnerRequest {
  name?: string
  is_customer?: boolean
  is_supplier?: boolean
  phone?: string
  email?: string
  address?: string
  tax_number?: string
  credit_limit?: number
}

// ============================================================================
// ATTRIBUTE ENGINE TYPES
// ============================================================================
export type AttributeDataType = "text" | "number" | "date" | "boolean"

export interface Attribute {
  id: string
  name: string
  label: string
  data_type: AttributeDataType
  is_required: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateAttributeRequest {
  name: string
  label: string
  data_type: AttributeDataType
  is_required: boolean
}

export interface UpdateAttributeRequest {
  name?: string
  label?: string
  data_type?: AttributeDataType
  is_required?: boolean
}

export interface AttributeSet {
  id: string
  name: string
  created_at?: string
  updated_at?: string
  items?: SetItem[]
}

export interface CreateAttributeSetRequest {
  name: string
}

export interface UpdateAttributeSetRequest {
  name?: string
}

export interface SetItem {
  id: string
  set_id: string
  attribute_id: string
  sort_order: number
  attribute?: Attribute
}

export interface CreateSetItemRequest {
  attribute_id: string
  sort_order: number
}

export interface ProductAttributeValue {
  id: string
  product_id: string
  attribute_id: string
  value_text?: string | null
  value_number?: number | null
  value_date?: string | null
  value_bool?: boolean | null
  attribute?: Attribute
}


export interface CreateProductAttributeValueRequest {
  attribute_id: string
  value_text?: string | null
  value_number?: number | null
  value_date?: string | null
  value_bool?: boolean | null
}

// ============================================================================
// PRODUCT TYPES
// ============================================================================
export interface Product {
  id: string
  name: string
  sku: string
  description?: string | null
  category_id?: string
  brand_id?: string | null
  unit_id?: string | null
  base_price?: number | null
  created_at?: string
  updated_at?: string
  category?: Category
  brand?: Brand
  unit?: Unit
  attributes?: ProductAttributeValue[]
}

// export interface Product {
//   id: string
//   name: string
//   sku: string
//   description?: string | null
//   category_id?: string
//   brand_id?: string | null
//   unit_id?: string | null
//   base_price?: number | string | null   // ← also important
//   created_at?: string
//   updated_at?: string

//   category?: Category
//   brand?: Brand
//   unit?: Unit

//   attribute_values?: ProductAttributeValue[] // ← FIXED
// }

export interface CreateProductRequest {
  name: string
  sku: string
  description?: string
  category_id: string
  brand_id?: string
  unit_id?: string
  base_price?: number
}

export interface UpdateProductRequest {
  name?: string
  sku?: string
  description?: string
  category_id?: string
  brand_id?: string
  unit_id?: string
  base_price?: number
}
