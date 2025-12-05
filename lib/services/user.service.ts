import type { User, CreateUserRequest, UpdateUserRequest } from "@/lib/types/user"

// ============================================================================
// MOCK DATA
// ============================================================================
let MOCK_USERS: User[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    isActive: true,
    roles: ["admin"],
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    isActive: true,
    roles: ["manager"],
  },
  {
    id: "3",
    firstName: "Bob",
    lastName: "Johnson",
    email: "bob@example.com",
    isActive: false,
    roles: ["user"],
  },
]

class UserService {
  // ============================================================================
  // PRODUCTION API METHODS (commented out - uncomment to use real API)
  // ============================================================================

  /*
  async getUsers(): Promise<User[]> {
    const response = await axiosInstance.get<User[]>(API_ENDPOINTS.users.list)
    return response.data
  }

  async getUser(id: string): Promise<User | null> {
    try {
      const response = await axiosInstance.get<User>(API_ENDPOINTS.users.detail(id))
      return response.data
    } catch {
      return null
    }
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await axiosInstance.post<User>(API_ENDPOINTS.users.list, data)
    return response.data
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<void> {
    await axiosInstance.patch(API_ENDPOINTS.users.detail(id), data)
  }

  async deleteUser(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.users.detail(id))
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<void> {
    await axiosInstance.patch(API_ENDPOINTS.users.status(id), { isActive })
  }

  async updateUserRoles(id: string, roleIds: string[]): Promise<void> {
    await axiosInstance.put(API_ENDPOINTS.users.roles(id), { roleIds })
  }
  */

  // ============================================================================
  // MOCK METHODS (currently active - comment out when using real API)
  // ============================================================================

  async getUsers(): Promise<User[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return MOCK_USERS
  }

  async getUser(id: string): Promise<User | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return MOCK_USERS.find((u) => u.id === id) || null
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newUser: User = {
      id: String(Date.now()),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      isActive: true,
      roles: [],
    }
    MOCK_USERS.push(newUser)
    return newUser
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = MOCK_USERS.findIndex((u) => u.id === id)
    if (index !== -1) {
      MOCK_USERS[index] = { ...MOCK_USERS[index], ...data }
    }
  }

  async deleteUser(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    MOCK_USERS = MOCK_USERS.filter((u) => u.id !== id)
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const user = MOCK_USERS.find((u) => u.id === id)
    if (user) {
      user.isActive = isActive
    }
  }

  async updateUserRoles(id: string, roleIds: string[]): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const user = MOCK_USERS.find((u) => u.id === id)
    if (user) {
      user.roles = roleIds
    }
  }
}

export const userService = new UserService()
