// Token Manager - Handles JWT tokens returned from API
// This provides a secure way to manage tokens without localStorage

class TokenManager {
  private static instance: TokenManager
  private accessToken: string | null = null
  private bootstrapped = false

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  async loadTokenFromServer() {
    if (this.bootstrapped) return

    const res = await fetch("/api/auth/get-token", { credentials: "include" })
    const data = await res.json()

    this.accessToken = data.accessToken || null
    this.bootstrapped = true
  }

  isBootstrapped() {
    return this.bootstrapped
  }

  setTokens(accessToken: string, refreshToken?: string): void {
    this.accessToken = accessToken

    // Store tokens in httpOnly cookies via API route for security
    if (typeof window !== "undefined") {
      fetch("/api/auth/set-tokens", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, refreshToken }),
      }).catch(() => {
        // Silent fail - tokens are still in memory for this session
      })
    }
  }

  setAccessToken(token: string) {
    this.accessToken = token
  }

  getAccessToken(): string | null {
    return this.accessToken
  }


  clearTokens(): void {
    this.accessToken = null

    // Clear httpOnly cookies via API route
    if (typeof window !== "undefined") {
      fetch("/api/auth/clear-tokens", {
        method: "POST",
        credentials: "include",
      }).catch(() => {
        // Silent fail
      })
    }
  }

}

export const tokenManager = TokenManager.getInstance()
