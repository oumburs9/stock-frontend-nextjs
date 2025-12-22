"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"

export function RequirePermission({
  permission,
  children,
}: {
  permission: string
  children: React.ReactNode
}) {
  const { hasPermission, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !hasPermission(permission)) {
      router.replace("/403")
    }
  }, [permission, hasPermission, isLoading, router])

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Checking permissions...</div>
  }

  if (!hasPermission(permission)) {
    return null
  }

  return <>{children}</>
}
