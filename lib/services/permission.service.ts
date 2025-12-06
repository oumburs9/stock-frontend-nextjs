import type { Permission, CreatePermissionRequest, UpdatePermissionRequest } from "@/lib/types/permission"
import { axiosInstance } from "../api/axios-instance"
import { API_ENDPOINTS } from "../config/api.config"

// ============================================================================
// MOCK DATA
// ============================================================================
let MOCK_PERMISSIONS: Permission[] = [
  { id: "1", name: "user:view", description: "View users" },
  { id: "2", name: "user:edit", description: "Edit users" },
  { id: "3", name: "user:delete", description: "Delete users" },
  { id: "4", name: "role:view", description: "View roles" },
  { id: "5", name: "role:edit", description: "Edit roles" },
  { id: "6", name: "permission:view", description: "View permissions" },
  { id: "7", name: "stock:view", description: "View stock" },
  { id: "8", name: "purchase:view", description: "View purchases" },
  { id: "9", name: "purchase:create", description: "Create purchases" },
  { id: "10", name: "dashboard:view", description: "View dashboard" },
]

class PermissionService {
  // ============================================================================
  // PRODUCTION API METHODS (commented out - uncomment to use real API)
  // ============================================================================

   
  async getPermissions(): Promise<Permission[]> {
    const response = await axiosInstance.get<Permission[]>(API_ENDPOINTS.permissions.list)
    return response.data
  }

  async getPermission(id: string): Promise<Permission | null> {
    try {
      const response = await axiosInstance.get<Permission>(
        API_ENDPOINTS.permissions.detail(id)
      )
      return response.data
    } catch {
      return null
    }
  }

  async createPermission(data: CreatePermissionRequest): Promise<Permission> {
    const response = await axiosInstance.post<Permission>(
      API_ENDPOINTS.permissions.list,
      data
    )
    return response.data
  }

  async updatePermission(id: string, data: UpdatePermissionRequest): Promise<void> {
    await axiosInstance.patch(API_ENDPOINTS.permissions.detail(id), data)
  }

  async deletePermission(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.permissions.detail(id))
  }


  // ============================================================================
  // MOCK METHODS (currently active - comment out when using real API)
  // ============================================================================
/*
  async getPermissions(): Promise<Permission[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return MOCK_PERMISSIONS
  }

  async getPermission(id: string): Promise<Permission | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return MOCK_PERMISSIONS.find((p) => p.id === id) || null
  }

  async createPermission(data: CreatePermissionRequest): Promise<Permission> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newPermission: Permission = {
      id: String(Date.now()),
      name: data.name,
      description: data.description,
    }
    MOCK_PERMISSIONS.push(newPermission)
    return newPermission
  }

  async updatePermission(id: string, data: UpdatePermissionRequest): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = MOCK_PERMISSIONS.findIndex((p) => p.id === id)
    if (index !== -1) {
      MOCK_PERMISSIONS[index] = { ...MOCK_PERMISSIONS[index], ...data }
    }
  }

  async deletePermission(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    MOCK_PERMISSIONS = MOCK_PERMISSIONS.filter((p) => p.id !== id)
  }
      */
}

export const permissionService = new PermissionService()
