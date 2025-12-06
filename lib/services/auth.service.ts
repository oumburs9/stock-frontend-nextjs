import { tokenManager } from "@/lib/api/token-manager"
import type { LoginRequest, LoginResponse, User, ChangePasswordRequest } from "@/lib/types/auth"
import { axiosInstance } from "../api/axios-instance"
import { API_ENDPOINTS } from "../config/api.config"

// ============================================================================
// MOCK DATA - Used for development/testing
// ============================================================================
const MOCK_USERS = [
  {
    id: "1",
    email: "admin@erp.com",
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
    roles: ["admin"],
    permissions: ["*"],
    isActive: true,
  },
  {
    id: "2",
    email: "manager@erp.com",
    password: "manager123",
    firstName: "Manager",
    lastName: "User",
    roles: ["manager"],
    permissions: ["user:view", "role:view", "stock:view"],
    isActive: true,
  },
]

let currentMockUser: User | null = null
let isAuthenticated = false

class AuthService {
  // ============================================================================
  // PRODUCTION API METHODS (commented out - uncomment to use real API)
  // ============================================================================

  
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>(
      API_ENDPOINTS.auth.login,
      credentials
    )
    
    // Store JWT tokens using TokenManager
    if (response.data.accessToken) {
      tokenManager.setTokens(
        response.data.accessToken,
        response.data.refreshToken
      )
    }
    
    return response.data
  }

  async logout(): Promise<void> {
    try {
      await axiosInstance.post(API_ENDPOINTS.auth.logout)
    } finally {
      // Always clear tokens even if API call fails
      tokenManager.clearTokens()
    }
  }

  async refreshToken(): Promise<LoginResponse> {
    const response = await axiosInstance.post<LoginResponse>(
      API_ENDPOINTS.auth.refresh,
      {},
      {
        headers: {
          Authorization: `Bearer ${tokenManager.getRefreshToken()}`,
        },
      }
    )
    
    if (response.data.accessToken) {
      tokenManager.setTokens(
        response.data.accessToken,
        response.data.refreshToken
      )
    }
    
    return response.data
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await axiosInstance.get<User>(API_ENDPOINTS.auth.me)
      return response.data
    } catch (error) {
      return null
    }
  }

  async updateProfile(data: Partial<User>): Promise<void> {
    await axiosInstance.patch(API_ENDPOINTS.auth.me, data)
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.auth.changePassword, data)
  }
  

  // ============================================================================
  // MOCK METHODS (currently active - comment out when using real API)
  // ============================================================================
  /*
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    const user = MOCK_USERS.find((u) => u.email === credentials.email && u.password === credentials.password)

    if (!user || !user.isActive) {
      throw new Error("Invalid credentials")
    }

    const userData = { ...user, password: undefined }
    currentMockUser = userData as User
    isAuthenticated = true

    // Mock JWT tokens
    const mockAccessToken = "mock-jwt-token-" + Date.now()
    const mockRefreshToken = "mock-refresh-token-" + Date.now()

    // Store in TokenManager for consistency
    tokenManager.setTokens(mockAccessToken, mockRefreshToken)

    return {
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
    }
  }

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    currentMockUser = null
    isAuthenticated = false
    tokenManager.clearTokens()
  }

  async getCurrentUser(): Promise<User | null> {
    if (!isAuthenticated) return null
    return currentMockUser
  }

  async updateProfile(data: Partial<User>): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    if (currentMockUser) {
      currentMockUser = { ...currentMockUser, ...data }
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    if (data.currentPassword === "wrongpassword") {
      throw new Error("Current password is incorrect")
    }
  }
  */
  // ============================================================================
  // COMMON METHODS (work for both mock and production)
  // ============================================================================

  hasPermission(permission: string, user: User | null): boolean {
    if (!user) return false
    return user.permissions.includes("*") || user.permissions.includes(permission)
  }

  // Check if we're authenticated (has valid token)
  isAuthenticated(): boolean {
    return !!tokenManager.getAccessToken()
  }
}

export const authService = new AuthService()
