import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"
import { API_CONFIG } from "@/lib/config/api.config"
import { tokenManager } from "@/lib/api/token-manager"

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
  },
})

// Attach access token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Handle auth errors safely
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    const isAuthRequest =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh")

    // If auth endpoint fails → logout immediately
    if (isAuthRequest) {
      tokenManager.clearTokens()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
      return Promise.reject(error)
    }

    // Try refresh ONCE
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshResponse = await axios.post(
          `${API_CONFIG.baseURL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${tokenManager.getRefreshToken()}`,
            },
          },
        )

        tokenManager.setTokens(refreshResponse.data)

        const newToken = tokenManager.getAccessToken()
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }

        return axiosInstance(originalRequest)
      } catch {
        // Refresh failed → logout
        tokenManager.clearTokens()
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)
