export interface UserRole {
  id: string
  name: string
  description?: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
  roles: UserRole[]   // ← ARRAY OF ROLE OBJECTS
}

export interface CreateUserRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  // roleIds: string[]
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  roleIds?: string[]
}
