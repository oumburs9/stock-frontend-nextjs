"use client"

import { useEffect, useState } from "react"
import { tokenManager } from "@/lib/api/token-manager"

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    tokenManager.loadTokenFromServer().finally(() => {
      setReady(true)
    })
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen bg-background" />
    )
  }

  return <>{children}</>
}
