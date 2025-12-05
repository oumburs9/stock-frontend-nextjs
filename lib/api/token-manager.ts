// Token Manager - Handles JWT tokens returned from API
// This provides a secure way to manage tokens without localStorage

class TokenManager {
  private static instance: TokenManager
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private refreshPromise: Promise<void> | null = null

  private constructor() {}

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  setTokens(accessToken: string, refreshToken?: string): void {
    this.accessToken = accessToken
    if (refreshToken) {
      this.refreshToken = refreshToken
    }

    // Store tokens in httpOnly cookies via API route for security
    if (typeof window !== "undefined") {
      fetch("/api/auth/set-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, refreshToken }),
      }).catch(() => {
        // Silent fail - tokens are still in memory for this session
      })
    }
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  getRefreshToken(): string | null {
    return this.refreshToken
  }

  clearTokens(): void {
    this.accessToken = null
    this.refreshToken = null
    this.refreshPromise = null

    // Clear httpOnly cookies via API route
    if (typeof window !== "undefined") {
      fetch("/api/auth/clear-tokens", {
        method: "POST",
      }).catch(() => {
        // Silent fail
      })
    }
  }

  async refreshAccessToken(refreshFn: () => Promise<{ accessToken: string; refreshToken?: string }>): Promise<void> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = (async () => {
      try {
        const tokens = await refreshFn()
        this.setTokens(tokens.accessToken, tokens.refreshToken)
      } finally {
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  isTokenExpiringSoon(): boolean {
    if (!this.accessToken) return true

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(this.accessToken.split(".")[1]))
      const expiresAt = payload.exp * 1000 // Convert to milliseconds
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000

      // Return true if token expires in less than 5 minutes
      return expiresAt - now < fiveMinutes
    } catch {
      return true
    }
  }
}

export const tokenManager = TokenManager.getInstance()
