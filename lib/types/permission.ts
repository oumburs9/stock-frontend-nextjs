export interface Permission {
  id: string
  name: string
  description?: string
}

export interface CreatePermissionRequest {
  name: string
  description?: string
}

export interface UpdatePermissionRequest {
  description?: string
}
