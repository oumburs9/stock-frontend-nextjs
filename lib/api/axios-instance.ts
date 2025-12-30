import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"
import { API_CONFIG } from "@/lib/config/api.config"
import { tokenManager } from "@/lib/api/token-manager"

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  withCredentials: API_CONFIG.withCredentials,
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

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      // Call Next.js refresh route (NOT backend directly)
      const refreshRes = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      })

      if (!refreshRes.ok) {
        throw new Error("Refresh failed")
      }

      const { accessToken } = await refreshRes.json()

      // Update token in memory
      tokenManager.setAccessToken(accessToken)

      // Retry original request with new token
      originalRequest.headers.Authorization = `Bearer ${accessToken}`

      return axiosInstance(originalRequest)
    } catch {
      // Refresh failed → force logout
      tokenManager.clearTokens()
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
      return Promise.reject(error)
    }
  }
)
