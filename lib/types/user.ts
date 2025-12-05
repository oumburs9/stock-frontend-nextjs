export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
  roles: string[]
}

export interface CreateUserRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  roleIds: string[]
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  roleIds?: string[]
}
