import type { Role, CreateRoleRequest, UpdateRoleRequest, RolePermissions } from "@/lib/types/role"
import { axiosInstance } from "../api/axios-instance"
import { API_ENDPOINTS } from "../config/api.config"
import { Permission } from "../types/permission"

// ============================================================================
// MOCK DATA
// ============================================================================
let MOCK_ROLES: Role[] = [
  { id: "1", name: "admin", description: "Full system access" },
  { id: "2", name: "manager", description: "Manage operations" },
  { id: "3", name: "user", description: "Basic access" },
]

const MOCK_ROLE_PERMISSIONS: Record<string, string[]> = {
  "1": ["user:view", "user:edit", "user:delete", "role:view", "role:edit", "permission:view"],
  "2": ["user:view", "stock:view", "purchase:view", "purchase:create"],
  "3": ["dashboard:view"],
}

class RoleService {
  // ============================================================================
  // PRODUCTION API METHODS (commented out - uncomment to use real API)
  // ============================================================================

 
  async getRoles(): Promise<Role[]> {
    const response = await axiosInstance.get<Role[]>(API_ENDPOINTS.roles.list)
    return response.data
  }

  async getRole(id: string): Promise<Role | null> {
    try {
      const response = await axiosInstance.get<Role>(API_ENDPOINTS.roles.detail(id))
      return response.data
    } catch {
      return null
    }
  }

  async createRole(data: CreateRoleRequest): Promise<Role> {
    const response = await axiosInstance.post<Role>(API_ENDPOINTS.roles.list, data)
    return response.data
  }

  async updateRole(id: string, data: UpdateRoleRequest): Promise<void> {
    await axiosInstance.patch(API_ENDPOINTS.roles.detail(id), data)
  }

  async deleteRole(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.roles.detail(id))
  }

  async getRolePermissions(id: string): Promise<Permission[]> { 
    const response = await axiosInstance.get<Permission[]>(
      API_ENDPOINTS.roles.permissions(id)
    )
    return response.data
  }

  async updateRolePermissions(id: string, permissionIds: string[]): Promise<RolePermissions> {
    const response = await axiosInstance.put<RolePermissions>(
      API_ENDPOINTS.roles.permissions(id),
      { permissionIds }
    )
    return response.data
  }


  // ============================================================================
  // MOCK METHODS (currently active - comment out when using real API)
  // ============================================================================

  /*
  async getRoles(): Promise<Role[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return MOCK_ROLES
  }

  async getRole(id: string): Promise<Role | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return MOCK_ROLES.find((r) => r.id === id) || null
  }

  async createRole(data: CreateRoleRequest): Promise<Role> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newRole: Role = {
      id: String(Date.now()),
      name: data.name,
      description: data.description,
    }
    MOCK_ROLES.push(newRole)
    MOCK_ROLE_PERMISSIONS[newRole.id] = []
    return newRole
  }

  async updateRole(id: string, data: UpdateRoleRequest): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = MOCK_ROLES.findIndex((r) => r.id === id)
    if (index !== -1) {
      MOCK_ROLES[index] = { ...MOCK_ROLES[index], ...data }
    }
  }

  async deleteRole(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    MOCK_ROLES = MOCK_ROLES.filter((r) => r.id !== id)
    delete MOCK_ROLE_PERMISSIONS[id]
  }

  async getRolePermissions(id: string): Promise<string[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return MOCK_ROLE_PERMISSIONS[id] || []
  }

  async updateRolePermissions(id: string, permissionIds: string[]): Promise<RolePermissions> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    MOCK_ROLE_PERMISSIONS[id] = permissionIds
    return { roleId: id, permissions: permissionIds }
  }*/
}

export const roleService = new RoleService()
