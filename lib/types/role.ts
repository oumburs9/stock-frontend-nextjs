export interface Role {
  id: string
  name: string
  description?: string
}

export interface CreateRoleRequest {
  name: string
  description?: string
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
}

export interface RolePermissions {
  roleId: string
  permissions: string[]
}
