import type {
  AttributeSet,
  CreateAttributeSetRequest,
  UpdateAttributeSetRequest,
  SetItem,
  CreateSetItemRequest,
  PaginatedResponse,
  Attribute,
} from "@/lib/types/master-data"
import { axiosInstance } from "../api/axios-instance"

// ============================================================================
// MOCK DATA
// ============================================================================
const mockAttributes: Attribute[] = [
  {
    id: "1",
    name: "warranty",
    label: "Warranty Period",
    data_type: "text",
    is_required: true,
  },
  {
    id: "2",
    name: "voltage",
    label: "Voltage",
    data_type: "number",
    is_required: false,
  },
  {
    id: "3",
    name: "warranty_years",
    label: "Warranty Years",
    data_type: "number",
    is_required: true,
  },
  {
    id: "4",
    name: "color",
    label: "Color",
    data_type: "text",
    is_required: false,
  },
  {
    id: "5",
    name: "size",
    label: "Size",
    data_type: "text",
    is_required: false,
  },
  {
    id: "6",
    name: "weight",
    label: "Weight (kg)",
    data_type: "number",
    is_required: false,
  },
]

const mockSetItems: SetItem[] = [
  {
    id: "1",
    set_id: "1",
    attribute_id: "1",
    sort_order: 1,
    attribute: mockAttributes[0],
  },
  {
    id: "2",
    set_id: "1",
    attribute_id: "2",
    sort_order: 2,
    attribute: mockAttributes[1],
  },
  {
    id: "3",
    set_id: "1",
    attribute_id: "3",
    sort_order: 3,
    attribute: mockAttributes[2],
  },
  {
    id: "4",
    set_id: "2",
    attribute_id: "4",
    sort_order: 1,
    attribute: mockAttributes[3],
  },
  {
    id: "5",
    set_id: "2",
    attribute_id: "5",
    sort_order: 2,
    attribute: mockAttributes[4],
  },
  {
    id: "6",
    set_id: "2",
    attribute_id: "6",
    sort_order: 3,
    attribute: mockAttributes[5],
  },
]

const mockAttributeSets: AttributeSet[] = [
  {
    id: "1",
    name: "Electronics Attributes",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    items: mockSetItems.filter((item) => item.set_id === "1"),
  },
  {
    id: "2",
    name: "Clothing Attributes",
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
    items: mockSetItems.filter((item) => item.set_id === "2"),
  },
  {
    id: "3",
    name: "Books Attributes",
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z",
    items: [],
  },
]

// ============================================================================
// ATTRIBUTE SET SERVICE
// ============================================================================
// export const attributeSetService = {
//   // Get all attribute sets
//   getAttributeSets: async (params?: {
//     search?: string
//     page?: number
//     limit?: number
//   }): Promise<PaginatedResponse<AttributeSet>> => {
//     // await new Promise((resolve) => setTimeout(resolve, 300))
//     // let filtered = [...mockAttributeSets]

//     // if (params?.search) {
//     //   filtered = filtered.filter((set) => set.name.toLowerCase().includes(params.search!.toLowerCase()))
//     // }

//     // return {
//     //   items: filtered,
//     //   total: filtered.length,
//     //   page: params?.page || 1,
//     //   limit: params?.limit || 10,
//     // }

//     // PRODUCTION: Uncomment when connecting to real API
//     const response = await axiosInstance.get<PaginatedResponse<AttributeSet>>('/master-data/attribute-engine/attributes', { params })
//     return response.data
//   },

//   // Get single attribute set
//   getAttributeSet: async (id: string): Promise<AttributeSet> => {
//     await new Promise((resolve) => setTimeout(resolve, 300))
//     const set = mockAttributeSets.find((s) => s.id === id)
//     if (!set) throw new Error("Attribute set not found")
//     return set

//     // PRODUCTION: Uncomment when connecting to real API
//     // const response = await apiClient.get<AttributeSet>(`/api/attribute-sets/${id}`)
//     // return response.data
//   },

//   // Create attribute set
//   createAttributeSet: async (data: CreateAttributeSetRequest): Promise<AttributeSet> => {
//     await new Promise((resolve) => setTimeout(resolve, 300))
//     const newSet: AttributeSet = {
//       id: String(mockAttributeSets.length + 1),
//       ...data,
//       created_at: new Date().toISOString(),
//       updated_at: new Date().toISOString(),
//       items: [],
//     }
//     mockAttributeSets.push(newSet)
//     return newSet

//     // PRODUCTION: Uncomment when connecting to real API
//     // const response = await apiClient.post<AttributeSet>('/api/attribute-sets', data)
//     // return response.data
//   },

//   // Update attribute set
//   updateAttributeSet: async (id: string, data: UpdateAttributeSetRequest): Promise<void> => {
//     await new Promise((resolve) => setTimeout(resolve, 300))
//     const index = mockAttributeSets.findIndex((s) => s.id === id)
//     if (index !== -1) {
//       mockAttributeSets[index] = {
//         ...mockAttributeSets[index],
//         ...data,
//         updated_at: new Date().toISOString(),
//       }
//     }

//     // PRODUCTION: Uncomment when connecting to real API
//     // await apiClient.patch(`/api/attribute-sets/${id}`, data)
//   },

//   // Delete attribute set
//   deleteAttributeSet: async (id: string): Promise<void> => {
//     await new Promise((resolve) => setTimeout(resolve, 300))
//     const index = mockAttributeSets.findIndex((s) => s.id === id)
//     if (index !== -1) {
//       mockAttributeSets.splice(index, 1)
//       const itemIndices = mockSetItems.map((item, idx) => (item.set_id === id ? idx : -1)).filter((idx) => idx !== -1)
//       itemIndices.reverse().forEach((idx) => mockSetItems.splice(idx, 1))
//     }

//     // PRODUCTION: Uncomment when connecting to real API
//     // await apiClient.delete(`/api/attribute-sets/${id}`)
//   },

//   // Get attributes in a set
//   getSetItems: async (setId: string): Promise<SetItem[]> => {
//     await new Promise((resolve) => setTimeout(resolve, 300))
//     return mockSetItems.filter((item) => item.set_id === setId).sort((a, b) => a.sort_order - b.sort_order)

//     // PRODUCTION: Uncomment when connecting to real API
//     // const response = await apiClient.get<SetItem[]>(`/api/attribute-sets/${setId}/items`)
//     // return response.data
//   },

//   // Add attribute to set
//   addSetItem: async (setId: string, data: CreateSetItemRequest): Promise<SetItem> => {
//     await new Promise((resolve) => setTimeout(resolve, 300))
//     const attribute = mockAttributes.find((a) => a.id === data.attribute_id)
//     if (!attribute) throw new Error("Attribute not found")

//     const newItem: SetItem = {
//       id: String(mockSetItems.length + 1),
//       set_id: setId,
//       ...data,
//       attribute,
//     }
//     mockSetItems.push(newItem)
//     const set = mockAttributeSets.find((s) => s.id === setId)
//     if (set) {
//       set.items = mockSetItems.filter((item) => item.set_id === setId)
//     }
//     return newItem

//     // PRODUCTION: Uncomment when connecting to real API
//     // const response = await apiClient.post<SetItem>(`/api/attribute-sets/${setId}/items`, data)
//     // return response.data
//   },

//   // Remove attribute from set
//   removeSetItem: async (setId: string, itemId: string): Promise<void> => {
//     await new Promise((resolve) => setTimeout(resolve, 300))
//     const index = mockSetItems.findIndex((item) => item.id === itemId && item.set_id === setId)
//     if (index !== -1) {
//       mockSetItems.splice(index, 1)
//       const set = mockAttributeSets.find((s) => s.id === setId)
//       if (set) {
//         set.items = mockSetItems.filter((item) => item.set_id === setId)
//       }
//     }

//     // PRODUCTION: Uncomment when connecting to real API
//     // await apiClient.delete(`/api/attribute-sets/${setId}/items/${itemId}`)
//   },

//   // Update item sort order
//   updateSetItemOrder: async (setId: string, itemId: string, sortOrder: number): Promise<void> => {
//     await new Promise((resolve) => setTimeout(resolve, 300))
//     const item = mockSetItems.find((i) => i.id === itemId && i.set_id === setId)
//     if (item) {
//       item.sort_order = sortOrder
//     }

//     // PRODUCTION: Uncomment when connecting to real API
//     // await apiClient.patch(`/api/attribute-sets/${setId}/items/${itemId}`, { sort_order: sortOrder })
//   },

//   // Bulk add attributes to set
//   bulkAddSetItems: async (setId: string, attributeIds: string[]): Promise<SetItem[]> => {
//     await new Promise((resolve) => setTimeout(resolve, 300))
//     const items: SetItem[] = []
//     const currentMaxOrder = Math.max(
//       0,
//       ...mockSetItems.filter((item) => item.set_id === setId).map((item) => item.sort_order),
//     )

//     attributeIds.forEach((attributeId, index) => {
//       const attribute = mockAttributes.find((a) => a.id === attributeId)
//       if (attribute) {
//         const newItem: SetItem = {
//           id: String(mockSetItems.length + 1),
//           set_id: setId,
//           attribute_id: attributeId,
//           sort_order: currentMaxOrder + index + 1,
//           attribute,
//         }
//         mockSetItems.push(newItem)
//         items.push(newItem)
//       }
//     })

//     const set = mockAttributeSets.find((s) => s.id === setId)
//     if (set) {
//       set.items = mockSetItems.filter((item) => item.set_id === setId)
//     }
//     return items

//     // PRODUCTION: Uncomment when connecting to real API
//     // const response = await apiClient.post<SetItem[]>(`/api/attribute-sets/${setId}/items/bulk`, { attribute_ids: attributeIds })
//     // return response.data
//   },

//   // Bulk remove attributes from set
//   bulkRemoveSetItems: async (setId: string, itemIds: string[]): Promise<void> => {
//     await new Promise((resolve) => setTimeout(resolve, 300))
//     itemIds.forEach((itemId) => {
//       const index = mockSetItems.findIndex((item) => item.id === itemId && item.set_id === setId)
//       if (index !== -1) {
//         mockSetItems.splice(index, 1)
//       }
//     })

//     const set = mockAttributeSets.find((s) => s.id === setId)
//     if (set) {
//       set.items = mockSetItems.filter((item) => item.set_id === setId)
//     }

//     // PRODUCTION: Uncomment when connecting to real API
//     // await apiClient.post(`/api/attribute-sets/${setId}/items/bulk-delete`, { item_ids: itemIds })
//   },
// }

export class AttributeSetService {
  // -----------------------
  // LIST ATTRIBUTE SETS
  // -----------------------
  async getAttributeSets(params?: { limit?: number; page?: number }) {
    const response = await axiosInstance.get<{ items: AttributeSet[] }>(
      "/master-data/attribute-engine/sets",
      { params }
    );
    return { items: response.data }; // { items: [...] }
  }

  // -----------------------
  // GET SINGLE SET
  // -----------------------
  async getAttributeSet(id: string): Promise<AttributeSet | null> {
    try {
      const response = await axiosInstance.get<AttributeSet>(
        `/master-data/attribute-engine/sets/${id}`
      );
      return response.data;
    } catch {
      return null;
    }
  }

  // -----------------------
  // CREATE SET
  // -----------------------
  async createAttributeSet(data: CreateAttributeSetRequest): Promise<AttributeSet> {
    const response = await axiosInstance.post<AttributeSet>(
      "/master-data/attribute-engine/sets",
      data
    );
    return response.data;
  }

  // -----------------------
  // UPDATE SET
  // -----------------------
  async updateAttributeSet(id: string, data: UpdateAttributeSetRequest): Promise<AttributeSet> {
    const response = await axiosInstance.put<AttributeSet>(
      `/master-data/attribute-engine/sets/${id}`,
      data
    );
    return response.data;
  }

  // -----------------------
  // DELETE SET
  // -----------------------
  async deleteAttributeSet(id: string): Promise<void> {
    await axiosInstance.delete(`/master-data/attribute-engine/sets/${id}`);
  }

  // -----------------------
  // GET SET ITEMS
  // -----------------------
  async getSetItems(setId: string): Promise<SetItem[]> {
    const response = await axiosInstance.get<SetItem[]>(
      `/master-data/attribute-engine/sets/${setId}/items`
    );
    return response.data;
  }

  // -----------------------
  // ADD ITEM TO SET
  // -----------------------
  async addSetItem(setId: string, data: CreateSetItemRequest): Promise<SetItem> {
    const response = await axiosInstance.post<SetItem>(
      `/master-data/attribute-engine/sets/${setId}/items`,
      data
    );
    return response.data;
  }

  // -----------------------
  // REMOVE ITEM FROM SET
  // -----------------------
  async removeSetItem(setId: string, itemId: string): Promise<void> {
    await axiosInstance.delete(`/master-data/attribute-engine/set-items/${itemId}`);
  }

  // -----------------------
  // UPDATE SORT ORDER
  // -----------------------
  async updateSetItemOrder(setId: string, itemId: string, sortOrder: number): Promise<void> {
    await axiosInstance.patch(`/master-data/attribute-engine/set-items/${itemId}`, {
      sort_order: sortOrder,
    });
  }

  // -----------------------
  // BULK ADD ITEMS
  // -----------------------
  async bulkAddSetItems(setId: string, attributeIds: string[]): Promise<SetItem[]> {
    const payload = attributeIds.map((id, index) => ({
      attribute_id: id,
      sort_order: index + 1,
    }));

    const response = await axiosInstance.post<SetItem[]>(
      `/master-data/attribute-engine/sets/${setId}/items/bulk-add`,
      payload
    );

    return response.data;
  }

  // -----------------------
  // BULK REMOVE ITEMS
  // -----------------------
  async bulkRemoveSetItems(setId: string, itemIds: string[]): Promise<void> {
    await axiosInstance.post(
      `/master-data/attribute-engine/sets/${setId}/items/bulk-remove`,
      { item_ids: itemIds }
    );
  }
}

export const attributeSetService = new AttributeSetService();