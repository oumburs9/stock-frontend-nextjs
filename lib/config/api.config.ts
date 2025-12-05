// API Configuration
export const API_CONFIG = {
  // Change this to your production API URL
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  timeout: 30000,
  withCredentials: true, // Important: Send cookies with requests
}

// Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    changePassword: "/auth/change-password",
    me: "/me",
  },
  users: {
    list: "/users",
    detail: (id: string) => `/users/${id}`,
    status: (id: string) => `/users/${id}/status`,
    roles: (id: string) => `/users/${id}/roles`,
  },
  roles: {
    list: "/roles",
    detail: (id: string) => `/roles/${id}`,
    permissions: (id: string) => `/roles/${id}/permissions`,
  },
  permissions: {
    list: "/permissions",
    detail: (id: string) => `/permissions/${id}`,
  },
}
